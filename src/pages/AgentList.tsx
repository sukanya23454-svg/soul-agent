import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Bot, LogOut, MessageSquare, Sparkles, Home, Upload, Store } from "lucide-react";
import type { Agent } from "@/integrations/supabase/database.types";
import { useToast } from "@/hooks/use-toast";

interface AgentWithAbilities extends Agent {
  abilityCount?: number;
}

const AgentList = () => {
  const [agents, setAgents] = useState<AgentWithAbilities[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: agentsData, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching agents:", error);
        toast({
          title: "Error",
          description: "Failed to load agents",
          variant: "destructive",
        });
      } else {
        // Fetch ability counts for each agent
        const agentsWithCounts = await Promise.all(
          (agentsData || []).map(async (agent) => {
            const { count } = await supabase
              .from("agent_abilities")
              .select("*", { count: 'exact', head: true })
              .eq("agent_id", agent.id);
            
            return {
              ...agent,
              abilityCount: count || 0
            };
          })
        );
        
        setAgents(agentsWithCounts);
      }

      setLoading(false);
    };

    init();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/files">
                <Button variant="ghost" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Files
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="ghost" size="sm">
                  <Store className="mr-2 h-4 w-4" />
                  Marketplace
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-gradient">Your AI Agents</h1>
            <p className="text-muted-foreground">
              Create and manage your custom AI agents
            </p>
          </div>
          <Link to="/create-agent">
            <Button size="lg" className="glow-cyan">
              <Plus className="mr-2" />
              Create New Agent
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <Bot className="w-16 h-16 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-bold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI agent to get started
            </p>
            <Link to="/create-agent">
              <Button className="glow-cyan">
                <Plus className="mr-2" />
                Create Your First Agent
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer group relative overflow-hidden"
                onClick={() => navigate(`/chat/${agent.id}`)}
              >
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex flex-col gap-4 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 truncate">{agent.name}</h3>
                      {agent.abilityCount !== undefined && agent.abilityCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {agent.abilityCount} {agent.abilityCount === 1 ? 'ability' : 'abilities'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {agent.description || agent.personality}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-primary pt-2 border-t border-border/50">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Start chatting</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentList;
