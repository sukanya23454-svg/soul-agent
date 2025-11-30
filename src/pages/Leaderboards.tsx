import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Bot, Star, Users, Heart, Copy } from "lucide-react";

interface TopAgent {
  id: string;
  name: string;
  description: string | null;
  rating_average: number;
  rating_count: number;
  like_count: number;
  clone_count: number;
  user_id: string;
}

interface TopCreator {
  user_id: string;
  agent_count: number;
  total_likes: number;
  total_clones: number;
}

const Leaderboards = () => {
  const [topAgentsByRating, setTopAgentsByRating] = useState<TopAgent[]>([]);
  const [topAgentsByLikes, setTopAgentsByLikes] = useState<TopAgent[]>([]);
  const [topAgentsByClones, setTopAgentsByClones] = useState<TopAgent[]>([]);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      // Top agents by rating
      const { data: ratingData } = await supabase
        .from("agents")
        .select("*")
        .eq("is_public", true)
        .order("rating_average", { ascending: false })
        .order("rating_count", { ascending: false })
        .limit(10);

      setTopAgentsByRating(ratingData || []);

      // Top agents by likes
      const { data: likesData } = await supabase
        .from("agents")
        .select("*")
        .eq("is_public", true)
        .order("like_count", { ascending: false })
        .limit(10);

      setTopAgentsByLikes(likesData || []);

      // Top agents by clones
      const { data: clonesData } = await supabase
        .from("agents")
        .select("*")
        .eq("is_public", true)
        .order("clone_count", { ascending: false })
        .limit(10);

      setTopAgentsByClones(clonesData || []);

      // Top creators (simplified - in production, you'd use a proper aggregation)
      const { data: creatorsData } = await supabase
        .from("agents")
        .select("user_id, like_count, clone_count")
        .eq("is_public", true);

      if (creatorsData) {
        const creatorMap = new Map<string, TopCreator>();
        
        creatorsData.forEach(agent => {
          const existing = creatorMap.get(agent.user_id);
          if (existing) {
            existing.agent_count++;
            existing.total_likes += agent.like_count || 0;
            existing.total_clones += agent.clone_count || 0;
          } else {
            creatorMap.set(agent.user_id, {
              user_id: agent.user_id,
              agent_count: 1,
              total_likes: agent.like_count || 0,
              total_clones: agent.clone_count || 0,
            });
          }
        });

        const creators = Array.from(creatorMap.values())
          .sort((a, b) => {
            const scoreA = a.agent_count * 10 + a.total_likes * 2 + a.total_clones;
            const scoreB = b.agent_count * 10 + b.total_likes * 2 + b.total_clones;
            return scoreB - scoreA;
          })
          .slice(0, 10);

        setTopCreators(creators);
      }
    } catch (error) {
      console.error("Error loading leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAgentCard = (agent: TopAgent, rank: number, metric: "rating" | "likes" | "clones") => (
    <Card
      key={agent.id}
      className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all cursor-pointer"
      onClick={() => navigate("/marketplace")}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
            rank === 2 ? "bg-gray-400/20 text-gray-400" :
            rank === 3 ? "bg-orange-500/20 text-orange-500" :
            "bg-muted/50 text-muted-foreground"
          }`}>
            {rank}
          </div>
          {rank <= 3 && <Trophy className={`w-5 h-5 ${
            rank === 1 ? "text-yellow-500" :
            rank === 2 ? "text-gray-400" :
            "text-orange-500"
          }`} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate">{agent.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {agent.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {metric === "rating" && (
              <div className="flex items-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <span className="font-bold">{agent.rating_average.toFixed(1)}</span>
                <span className="text-muted-foreground">({agent.rating_count})</span>
              </div>
            )}
            {metric === "likes" && (
              <div className="flex items-center gap-1 text-red-400">
                <Heart className="w-4 h-4 fill-red-400" />
                <span className="font-bold">{agent.like_count}</span>
              </div>
            )}
            {metric === "clones" && (
              <div className="flex items-center gap-1 text-blue-400">
                <Copy className="w-4 h-4" />
                <span className="font-bold">{agent.clone_count}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link to="/marketplace">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>

        <div className="mb-8 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Leaderboards</h1>
          <p className="text-muted-foreground">
            Discover the top agents and creators in the community
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboards...</p>
          </div>
        ) : (
          <Tabs defaultValue="rating" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
              <TabsTrigger value="rating">Top Rated</TabsTrigger>
              <TabsTrigger value="likes">Most Liked</TabsTrigger>
              <TabsTrigger value="clones">Most Cloned</TabsTrigger>
              <TabsTrigger value="creators">Top Creators</TabsTrigger>
            </TabsList>

            <TabsContent value="rating" className="mt-8">
              <div className="max-w-3xl mx-auto space-y-4">
                {topAgentsByRating.map((agent, index) => 
                  renderAgentCard(agent, index + 1, "rating")
                )}
              </div>
            </TabsContent>

            <TabsContent value="likes" className="mt-8">
              <div className="max-w-3xl mx-auto space-y-4">
                {topAgentsByLikes.map((agent, index) => 
                  renderAgentCard(agent, index + 1, "likes")
                )}
              </div>
            </TabsContent>

            <TabsContent value="clones" className="mt-8">
              <div className="max-w-3xl mx-auto space-y-4">
                {topAgentsByClones.map((agent, index) => 
                  renderAgentCard(agent, index + 1, "clones")
                )}
              </div>
            </TabsContent>

            <TabsContent value="creators" className="mt-8">
              <div className="max-w-3xl mx-auto space-y-4">
                {topCreators.map((creator, index) => (
                  <Card
                    key={creator.user_id}
                    className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/profile/${creator.user_id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                        index === 1 ? "bg-gray-400/20 text-gray-400" :
                        index === 2 ? "bg-orange-500/20 text-orange-500" :
                        "bg-muted/50 text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>

                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {creator.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h3 className="font-bold">Creator {creator.user_id.slice(0, 8)}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{creator.agent_count} agents</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {creator.total_likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" />
                            {creator.total_clones}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;
