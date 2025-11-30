import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Plus, MessageSquare, Zap, FileText,
  TrendingUp, Upload, Settings, LogOut, Users
} from "lucide-react";
import type { Agent, AgentMemory, AgentAutomation, Message } from "@/integrations/supabase/database.types";
import NotificationsPanel from "@/components/NotificationsPanel";
import StatsStreaksPanel from "@/components/StatsStreaksPanel";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [automations, setAutomations] = useState<AgentAutomation[]>([]);
  const [recentMessages, setRecentMessages] = useState<(Message & { agent?: Agent })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    await loadDashboardData();
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load agents (both private and published)
      const { data: agentsData } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAgents(agentsData || []);

      if (agentsData && agentsData.length > 0) {
        const agentIds = agentsData.map(a => a.id);

        // Load recent memories
        const { data: memoriesData } = await supabase
          .from("agent_memories")
          .select("*")
          .in("agent_id", agentIds)
          .order("created_at", { ascending: false })
          .limit(10);

        setMemories(memoriesData || []);

        // Load active automations
        const { data: automationsData } = await supabase
          .from("agent_automations")
          .select("*")
          .in("agent_id", agentIds)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        setAutomations(automationsData || []);

        // Load recent messages
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .in("agent_id", agentIds)
          .order("created_at", { ascending: false })
          .limit(5);

        // Enrich messages with agent info
        const enrichedMessages = messagesData?.map(msg => ({
          ...msg,
          agent: agentsData.find(a => a.id === msg.agent_id)
        })) || [];

        setRecentMessages(enrichedMessages);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">AI Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPanel />
              <Button variant="ghost" size="icon" onClick={() => navigate("/agents")}>
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{getGreeting()}!</h1>
          <p className="text-xl text-muted-foreground">
            Here's your AI activity overview
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Plus, label: "New Agent", onClick: () => navigate("/create-agent"), color: "text-primary" },
            { icon: MessageSquare, label: "Chat", onClick: () => navigate("/agents"), color: "text-blue-400" },
            { icon: Upload, label: "Upload Files", onClick: () => navigate("/files"), color: "text-green-400" },
            { icon: Settings, label: "Settings", onClick: () => navigate("/agents"), color: "text-orange-400" },
          ].map((action, i) => (
            <Card
              key={i}
              className="p-4 cursor-pointer hover:scale-105 transition-all hover:border-primary/50 bg-card/50 backdrop-blur-sm"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="font-medium">{action.label}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats & Streaks */}
        <StatsStreaksPanel />

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Agents</span>
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{agents.length}</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Messages</span>
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold">{recentMessages.length}</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Automations</span>
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold">{automations.length}</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Saved Memories</span>
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold">{memories.length}</div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Agents - Separated by Private/Published */}
          <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Your Agents</h2>
              <Button size="sm" onClick={() => navigate("/agents")}>
                View All
              </Button>
            </div>
            {agents.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No agents yet</p>
                <Button onClick={() => navigate("/create-agent")}>
                  Create Your First Agent
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Private Agents */}
                {agents.filter(a => !a.is_public).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Private Agents</h3>
                    <div className="space-y-3">
                      {agents.filter(a => !a.is_public).slice(0, 3).map((agent) => (
                        <div
                          key={agent.id}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/chat/${agent.id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{agent.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {agent.description}
                              </p>
                            </div>
                            <Badge variant="secondary">Private</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Agents */}
                {agents.filter(a => a.is_public).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Published Agents</h3>
                    <div className="space-y-3">
                      {agents.filter(a => a.is_public).slice(0, 3).map((agent) => (
                        <div
                          key={agent.id}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/chat/${agent.id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{agent.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {agent.description}
                              </p>
                            </div>
                            <Badge variant="default">Published</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent messages
                </p>
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {msg.agent?.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Automations Panel */}
        {automations.length > 0 && (
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Active Automations</h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {automations.slice(0, 6).map((automation) => (
                <div
                  key={automation.id}
                  className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
                >
                  <h3 className="font-medium mb-1">{automation.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {automation.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {automation.frequency}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {automation.action_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Insights Section */}
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Insights & Memories</h2>
          </div>
          {memories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No memories saved yet. Chat with your agents to build their memory!
            </p>
          ) : (
            <div className="space-y-3">
              {memories.slice(0, 5).map((memory) => (
                <div
                  key={memory.id}
                  className="p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {memory.memory_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Importance: {memory.importance}/10
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{memory.content}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;