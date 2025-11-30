import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import type { Agent, Conversation, Message } from "@/integrations/supabase/database.types";

const ChatWithAgent = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

      // Create or get conversation
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("agent_id", agentId)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (convError) {
        console.error("Error fetching conversation:", convError);
      }

      let currentConv = convData?.[0];

      if (!currentConv) {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            agent_id: agentId!,
            user_id: session.user.id,
            title: `Chat with ${agentData.name}`,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating conversation:", createError);
          return;
        }

        currentConv = newConv;
      }

      setConversation(currentConv);

      // Get messages
      if (currentConv) {
        const { data: msgData, error: msgError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", currentConv.id)
          .order("created_at", { ascending: true });

        if (!msgError && msgData) {
          setMessages(msgData);
        }
      }
    };

    init();
  }, [agentId, navigate, toast]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !conversation || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: 'temp-' + Date.now(),
      conversation_id: conversation.id,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke('chat-with-agent', {
        body: {
          conversationId: conversation.id,
          message: userMessage,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Refresh messages
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
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
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
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
          </div>
        </div>
      </div>

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
                    {msg.role === "user" ? "You" : agent?.name}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
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
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="bg-background/50"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
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
