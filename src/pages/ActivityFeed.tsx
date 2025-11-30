import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Bot, Heart, Star, Copy, UserPlus, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  agent_id: string | null;
  target_user_id: string | null;
  metadata: any;
  created_at: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "agent_published":
        return <Bot className="w-5 h-5 text-primary" />;
      case "agent_liked":
        return <Heart className="w-5 h-5 text-red-400" />;
      case "agent_rated":
        return <Star className="w-5 h-5 text-yellow-400" />;
      case "agent_cloned":
        return <Copy className="w-5 h-5 text-blue-400" />;
      case "user_followed":
        return <UserPlus className="w-5 h-5 text-green-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.activity_type) {
      case "agent_published":
        return "published a new agent";
      case "agent_liked":
        return "liked an agent";
      case "agent_rated":
        return "rated an agent";
      case "agent_cloned":
        return "cloned an agent";
      case "user_followed":
        return "followed a creator";
      default:
        return "did something";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link to="/marketplace">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Activity</h1>
          <p className="text-muted-foreground">
            See what the community is up to
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-bold mb-2">No activity yet</h3>
            <p className="text-muted-foreground">
              Be the first to create some activity!
            </p>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.activity_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {activity.metadata?.username || "Someone"}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {getActivityText(activity)}
                        </span>
                        {activity.metadata?.agent_name && (
                          <span className="font-semibold">
                            {" "}{activity.metadata.agent_name}
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {activity.metadata?.comment && (
                      <p className="text-sm text-muted-foreground">
                        "{activity.metadata.comment}"
                      </p>
                    )}
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

export default ActivityFeed;
