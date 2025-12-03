import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Zap, Paperclip, MoreVertical, Pencil, Trash2, History } from "lucide-react";
import type { Agent, Message, AgentAutomation } from "@/integrations/supabase/database.types";
import { AutomationCard } from "@/components/AutomationCard";
import { CreateAutomationDialog } from "@/components/CreateAutomationDialog";
import { FileUpload } from "@/components/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ChatWithAgent = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAutomations, setShowAutomations] = useState(false);
  const [automations, setAutomations] = useState<AgentAutomation[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", instructions: "" });
  const [isOwner, setIsOwner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const removeBoldMarkers = (text: string) => {
    return text.replace(/\*\*/g, '');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      if (!agentId) {
        toast({
          title: "Error",
          description: "Agent ID is missing",
          variant: "destructive",
        });
        navigate("/agents");
        return;
      }

      // Get agent - allow access to own agents OR public agents
      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .or(`user_id.eq.${session.user.id},is_public.eq.true`)
        .single();

      if (agentError || !agentData) {
        toast({
          title: "Error",
          description: "Agent not found or you don't have access",
          variant: "destructive",
        });
        navigate("/agents");
        return;
      }

      setAgent(agentData);
      setIsOwner(agentData.user_id === session.user.id);
      setEditForm({
        name: agentData.name || "",
        description: agentData.description || "",
        instructions: agentData.instructions || "",
      });

      // Get messages for this agent
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: true });

      if (!msgError && msgData) {
        setMessages(msgData);
      }
    };

    init();
    loadAutomations();
  }, [agentId, navigate, toast]);

  const loadAutomations = async () => {
    if (!agentId) return;
    
    const { data, error } = await supabase
      .from('agent_automations')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAutomations(data);
    }
  };

  const handleToggleAutomation = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('agent_automations')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update automation",
        variant: "destructive",
      });
    } else {
      loadAutomations();
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    const { error } = await supabase
      .from('agent_automations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Automation deleted",
      });
      loadAutomations();
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !agentId || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setLoading(true);

    // Optimistically add user message to UI
    const optimisticUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      agent_id: agentId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Call edge function to get AI response
      const { data: functionData, error: functionError } = await supabase.functions.invoke('chat-with-agent', {
        body: {
          agentId: agentId,
          message: userMessage,
        },
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Failed to get AI response');
      }

      if (!functionData) {
        throw new Error('No response from AI');
      }

      // Refresh messages from database to get the complete conversation
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: true });

      if (msgError) {
        console.error('Error fetching messages:', msgError);
        // Keep optimistic message if fetch fails
        return;
      }

      // Replace all messages with fresh data from database
      if (msgData) {
        setMessages(msgData);
      }
    } catch (error: any) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticUserMsg.id));
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgent = async () => {
    if (!agentId || !editForm.name.trim()) return;

    const { error } = await supabase
      .from('agents')
      .update({
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        instructions: editForm.instructions.trim(),
      })
      .eq('id', agentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update agent",
        variant: "destructive",
      });
    } else {
      setAgent(prev => prev ? { ...prev, ...editForm } : null);
      setShowEditDialog(false);
      toast({
        title: "Success",
        description: "Agent updated",
      });
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentId) return;

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Agent deleted",
      });
      navigate("/agents");
    }
  };

  const handleClearHistory = async () => {
    if (!agentId) return;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('agent_id', agentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    } else {
      setMessages([]);
      setShowClearHistoryDialog(false);
      toast({
        title: "Success",
        description: "Chat history cleared",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/agents">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              {agent && (
                <div>
                  <h1 className="text-2xl font-bold">{agent.name}</h1>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showAutomations ? "default" : "outline"}
                onClick={() => setShowAutomations(!showAutomations)}
              >
                <Zap className="mr-2 h-4 w-4" />
                Automations
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Agent
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setShowClearHistoryDialog(true)}>
                    <History className="mr-2 h-4 w-4" />
                    Clear History
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {showAutomations && (
        <div className="border-b border-border/50 bg-card/20">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Agent Automations</h2>
                <CreateAutomationDialog agentId={agentId!} onSuccess={loadAutomations} />
              </div>
              {automations.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No automations yet. Create one to get started!</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {automations.map((automation) => (
                    <AutomationCard
                      key={automation.id}
                      automation={automation}
                      onToggle={handleToggleAutomation}
                      onDelete={handleDeleteAutomation}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto relative">
        {/* Sticky back button */}
        <Link to="/agents" className="sticky top-4 left-4 z-10 inline-block ml-4 mt-4">
          <Button variant="outline" size="sm" className="bg-card/80 backdrop-blur-sm shadow-lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <Card
                key={msg.id || idx}
                className={`p-4 ${
                  msg.role === "user"
                    ? "bg-primary/10 ml-auto max-w-[80%]"
                    : "bg-card/50 mr-auto max-w-[80%]"
                }`}
              >
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {msg.role === "user" ? "You" : agent?.name || "Agent"}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{removeBoldMarkers(msg.content)}</div>
                </div>
              </Card>
            ))}
            {loading && (
              <Card className="p-4 bg-card/50 mr-auto max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </Card>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                </DialogHeader>
                <FileUpload 
                  agentId={agentId!} 
                  onUploadComplete={() => {
                    setShowFileUpload(false);
                    toast({
                      title: "Success",
                      description: "File uploaded and being analyzed",
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="bg-background/50"
              disabled={loading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !inputMessage.trim()}
              className="glow-cyan"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>Update your agent's details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Agent name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={editForm.instructions}
                onChange={(e) => setEditForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="How should the agent behave?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditAgent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Agent Alert */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agent?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAgent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear History Alert */}
      <AlertDialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all messages? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatWithAgent;
