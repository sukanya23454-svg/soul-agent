import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Zap, Calendar } from "lucide-react";

interface UserActivity {
  current_streak: number;
  longest_streak: number;
  total_messages: number;
  total_automations_triggered: number;
  last_active_date: string | null;
}

const StatsStreaksPanel = () => {
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if user activity exists
      let { data: existingActivity } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!existingActivity) {
        // Create initial activity record
        const { data: newActivity, error } = await supabase
          .from("user_activity")
          .insert({
            user_id: session.user.id,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: new Date().toISOString().split('T')[0],
            total_messages: 0,
            total_automations_triggered: 0,
          })
          .select()
          .single();

        if (error) throw error;
        existingActivity = newActivity;
      } else {
        // Update streak if needed
        const today = new Date().toISOString().split('T')[0];
        const lastActive = existingActivity.last_active_date;

        if (lastActive !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = existingActivity.current_streak;

          if (lastActive === yesterdayStr) {
            // Consecutive day, increment streak
            newStreak += 1;
          } else if (lastActive && lastActive < yesterdayStr) {
            // Streak broken, reset
            newStreak = 1;
          }

          const longestStreak = Math.max(
            existingActivity.longest_streak,
            newStreak
          );

          const { data: updated } = await supabase
            .from("user_activity")
            .update({
              current_streak: newStreak,
              longest_streak: longestStreak,
              last_active_date: today,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", session.user.id)
            .select()
            .single();

          existingActivity = updated || existingActivity;
        }
      }

      setActivity(existingActivity);
    } catch (error: any) {
      console.error("Error loading activity:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !activity) {
    return null;
  }

  const stats = [
    {
      icon: Flame,
      label: "Current Streak",
      value: `${activity.current_streak} ${activity.current_streak === 1 ? "day" : "days"}`,
      color: "text-orange-400",
      bgColor: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
    },
    {
      icon: TrendingUp,
      label: "Longest Streak",
      value: `${activity.longest_streak} ${activity.longest_streak === 1 ? "day" : "days"}`,
      color: "text-blue-400",
      bgColor: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
    },
    {
      icon: Zap,
      label: "Automations Run",
      value: activity.total_automations_triggered,
      color: "text-green-400",
      bgColor: "from-green-500/10 to-green-500/5 border-green-500/20",
    },
    {
      icon: Calendar,
      label: "Last Active",
      value: activity.last_active_date
        ? new Date(activity.last_active_date).toLocaleDateString()
        : "Never",
      color: "text-purple-400",
      bgColor: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
    },
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-6 h-6 text-orange-400" />
        <h2 className="text-xl font-bold">Stats & Streaks</h2>
        {activity.current_streak >= 3 && (
          <Badge variant="secondary" className="ml-auto">
            🔥 On fire!
          </Badge>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg bg-gradient-to-br ${stat.bgColor} border transition-transform hover:scale-105`}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {activity.current_streak >= 7 && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
          <p className="text-sm font-medium text-primary">
            🎉 Amazing! You've maintained a {activity.current_streak}-day streak!
          </p>
        </div>
      )}
    </Card>
  );
};

export default StatsStreaksPanel;
