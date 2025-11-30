import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Zap } from "lucide-react";
import type { Agent, Message, AgentAutomation } from "@/integrations/supabase/database.types";
import { AutomationCard } from "@/components/AutomationCard";
import { CreateAutomationDialog } from "@/components/CreateAutomationDialog";

const ChatWithAgent = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAutomations, setShowAutomations] = useState(false);
  const [automations, setAutomations] = useState<AgentAutomation[]>([]);
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

      // Get agent
      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .eq("user_id", session.user.id)
        .single();

      if (agentError || !agentData) {
        toast({
          title: "Error",
          description: "Agent not found",
          variant: "destructive",
        });
        navigate("/agents");
        return;
      }

      setAgent(agentData);

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

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Insert user message
      const { data: userMsg, error: userError } = await supabase
        .from("messages")
        .insert({
          agent_id: agentId,
          role: "user",
          content: userMessage,
        })
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // Add user message to UI
      if (userMsg) {
        setMessages(prev => [...prev, userMsg]);
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

      // Refresh messages to get AI response
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: true });

      if (msgData) {
        setMessages(msgData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <Button
              variant={showAutomations ? "default" : "outline"}
              onClick={() => setShowAutomations(!showAutomations)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Automations
            </Button>
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

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
    </div>
  );
};

export default ChatWithAgent;
