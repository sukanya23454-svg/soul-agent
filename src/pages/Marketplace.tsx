import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bot, Star, Copy, Search, TrendingUp, Clock, Users } from "lucide-react";
import type { Agent } from "@/integrations/supabase/database.types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Marketplace = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "rating">("popular");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAgents = async () => {
    setLoading(true);
    
    let query = supabase
      .from("agents")
      .select("*")
      .eq("is_public", true);

    // Apply sorting
    if (sortBy === "popular") {
      query = query.order("clone_count", { ascending: false });
    } else if (sortBy === "recent") {
      query = query.order("published_at", { ascending: false });
    } else if (sortBy === "rating") {
      query = query.order("rating_average", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to load marketplace agents",
        variant: "destructive",
      });
    } else {
      setAgents(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, [sortBy]);

  const handleClone = async (agent: Agent) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Clone the agent
      const { data: clonedAgent, error: cloneError } = await supabase
        .from("agents")
        .insert({
          user_id: session.user.id,
          name: `${agent.name} (Copy)`,
          description: agent.description,
          personality: agent.personality,
          instructions: agent.instructions,
          original_agent_id: agent.id,
        })
        .select()
        .single();

      if (cloneError) throw cloneError;

      // Clone abilities
      const { data: abilities } = await supabase
        .from("agent_abilities")
        .select("ability_id")
        .eq("agent_id", agent.id);

      if (abilities && abilities.length > 0 && clonedAgent) {
        const abilityInserts = abilities.map(ability => ({
          agent_id: clonedAgent.id,
          ability_id: ability.ability_id,
        }));

        await supabase.from("agent_abilities").insert(abilityInserts);
      }

      // Increment clone count
      await supabase
        .from("agents")
        .update({ clone_count: agent.clone_count + 1 })
        .eq("id", agent.id);

      toast({
        title: "Success!",
        description: "Agent cloned to your collection. You can customize it now.",
      });

      navigate(`/chat/${clonedAgent.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRateAgent = async () => {
    if (!selectedAgent) return;

    setSubmittingRating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("agent_ratings")
        .upsert({
          agent_id: selectedAgent.id,
          user_id: session.user.id,
          rating,
          review: review.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your rating has been submitted.",
      });

      setShowRatingDialog(false);
      setSelectedAgent(null);
      setRating(5);
      setReview("");
      fetchAgents(); // Refresh to show updated ratings
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <Link to="/agents">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Agents
            </Button>
          </Link>

          <div className="text-center space-y-4 mb-8">
            <h1 className="text-5xl font-bold text-gradient">Agent Marketplace</h1>
            <p className="text-xl text-muted-foreground">
              Discover, clone, and customize AI agents from the community
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={sortBy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("popular")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Popular
              </Button>
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("recent")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Recent
              </Button>
              <Button
                variant={sortBy === "rating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rating")}
              >
                <Star className="mr-2 h-4 w-4" />
                Top Rated
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <Bot className="w-16 h-16 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-bold mb-2">No agents found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search query" : "Be the first to publish an agent!"}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex flex-col gap-4 h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-1 truncate">{agent.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {agent.rating_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span>{agent.rating_average.toFixed(1)}</span>
                            <span>({agent.rating_count})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{agent.clone_count} clones</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {agent.description || agent.personality}
                  </p>
                  
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleClone(agent)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Clone
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowRatingDialog(true);
                      }}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {selectedAgent?.name}</DialogTitle>
            <DialogDescription>
              Share your experience with this agent to help others
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Review (Optional)</label>
              <Textarea
                placeholder="Share your thoughts about this agent..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRatingDialog(false);
                setSelectedAgent(null);
                setRating(5);
                setReview("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRateAgent} disabled={submittingRating}>
              {submittingRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
