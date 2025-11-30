import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Trash2, Calendar } from "lucide-react";
import type { AgentAutomation } from "@/integrations/supabase/database.types";

interface AutomationCardProps {
  automation: AgentAutomation;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const actionTypeLabels = {
  send_message: 'Send Message',
  summarize_chat: 'Summarize Chat',
  reminder: 'Reminder',
  auto_save_notes: 'Auto-save Notes'
};

const frequencyLabels = {
  hourly: 'Every hour',
  every_3_hours: 'Every 3 hours',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
};

export const AutomationCard = ({ automation, onToggle, onDelete }: AutomationCardProps) => {
  const formatNextRun = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{automation.name}</h3>
            <Badge variant="outline" className="text-xs">
              {actionTypeLabels[automation.action_type]}
            </Badge>
          </div>
          
          {automation.description && (
            <p className="text-sm text-muted-foreground">{automation.description}</p>
          )}
          
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {frequencyLabels[automation.frequency as keyof typeof frequencyLabels] || automation.frequency}
              {automation.time_of_day && ` at ${automation.time_of_day}`}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Next run: {formatNextRun(automation.next_run_at)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={automation.is_active}
            onCheckedChange={(checked) => onToggle(automation.id, checked)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(automation.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
