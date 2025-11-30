import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Bot, Heart, Users, UserPlus, UserMinus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface Agent {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  rating_average: number;
  rating_count: number;
  like_count: number;
  clone_count: number;
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [publishedAgents, setPublishedAgents] = useState<Agent[]>([]);
  const [likedAgents, setLikedAgents] = useState<Agent[]>([]);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Load user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      // Load published agents
      const { data: agentsData } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      setPublishedAgents(agentsData || []);

      // Load liked agents
      const { data: likesData } = await supabase
        .from("agent_likes")
        .select("agent_id")
        .eq("user_id", userId);

      if (likesData && likesData.length > 0) {
        const agentIds = likesData.map(l => l.agent_id);
        const { data: likedAgentsData } = await supabase
          .from("agents")
          .select("*")
          .in("id", agentIds)
          .eq("is_public", true);

        setLikedAgents(likedAgentsData || []);
      }

      // Load follower/following counts
      const { count: followerCount } = await supabase
        .from("user_follows")
        .select("*", { count: 'exact', head: true })
        .eq("following_id", userId);

      const { count: followingCount } = await supabase
        .from("user_follows")
        .select("*", { count: 'exact', head: true })
        .eq("follower_id", userId);

      setFollowers(followerCount || 0);
      setFollowing(followingCount || 0);

      // Check if current user is following this profile
      if (user) {
        const { data: followData } = await supabase
          .from("user_follows")
          .select("*")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || !userId) {
      navigate("/auth");
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);
        
        setIsFollowing(false);
        setFollowers(prev => prev - 1);
        
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user",
        });
      } else {
        await supabase
          .from("user_follows")
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });
        
        setIsFollowing(true);
        setFollowers(prev => prev + 1);
        
        toast({
          title: "Following",
          description: "You are now following this user",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Profile not found</h2>
          <Button onClick={() => navigate("/marketplace")}>
            Back to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link to="/marketplace">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {profile.username || "Anonymous User"}
              </h1>
              <p className="text-muted-foreground mb-4">{profile.bio}</p>

              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{publishedAgents.length}</div>
                  <div className="text-sm text-muted-foreground">Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{followers}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{following}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>

              {!isOwnProfile && currentUserId && (
                <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                  {isFollowing ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="agents">Published Agents</TabsTrigger>
            <TabsTrigger value="liked">Liked Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-6">
            {publishedAgents.length === 0 ? (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
                <Bot className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                <h3 className="text-xl font-bold mb-2">No published agents</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Publish your first agent to share it with the community" : "This user hasn't published any agents yet"}
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/marketplace`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">{agent.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span>{agent.rating_average.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{agent.like_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            {likedAgents.length === 0 ? (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
                <Heart className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                <h3 className="text-xl font-bold mb-2">No liked agents</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Like agents to save them here" : "This user hasn't liked any agents yet"}
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/marketplace`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">{agent.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span>{agent.rating_average.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{agent.like_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
