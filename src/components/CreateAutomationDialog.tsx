import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateAutomationDialogProps {
  agentId: string;
  onSuccess: () => void;
}

export const CreateAutomationDialog = ({ agentId, onSuccess }: CreateAutomationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [actionType, setActionType] = useState<'send_message' | 'summarize_chat' | 'reminder' | 'auto_save_notes'>('send_message');
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the automation",
        variant: "destructive",
      });
      return;
    }

    if ((actionType === 'send_message' || actionType === 'reminder') && !message.trim()) {
      toast({
        title: "Error",
        description: "Please provide a message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Calculate next run time
      const nextRun = calculateNextRun(frequency, timeOfDay);

      const actionConfig: Record<string, any> = {};
      if (actionType === 'send_message') {
        actionConfig.message = message;
      } else if (actionType === 'reminder') {
        actionConfig.reminder = message;
      }

      const { error } = await supabase
        .from('agent_automations')
        .insert({
          agent_id: agentId,
          user_id: session.user.id,
          name: name.trim(),
          description: description.trim() || null,
          frequency,
          time_of_day: timeOfDay,
          action_type: actionType,
          action_config: actionConfig,
          next_run_at: nextRun,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation created successfully",
      });

      setOpen(false);
      setName("");
      setDescription("");
      setMessage("");
      setFrequency("daily");
      setTimeOfDay("09:00");
      setActionType("send_message");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating automation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create automation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glow-cyan">
          <Plus className="mr-2 h-4 w-4" />
          Create Automation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Automation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning motivation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Send a motivational message every morning"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionType">Action Type</Label>
            <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_message">Send Message</SelectItem>
                <SelectItem value="summarize_chat">Summarize Chat</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="auto_save_notes">Auto-save Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(actionType === 'send_message' || actionType === 'reminder') && (
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What should the agent say?"
                rows={3}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="every_3_hours">Every 3 hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Automation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function calculateNextRun(frequency: string, timeOfDay: string): string {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':');
  const targetHour = parseInt(hours);
  const targetMinute = parseInt(minutes);

  let nextRun = new Date(now);

  switch (frequency) {
    case 'hourly':
      nextRun.setHours(now.getHours() + 1);
      break;
    case 'every_3_hours':
      nextRun.setHours(now.getHours() + 3);
      break;
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + 7);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
      break;
    default:
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
  }

  return nextRun.toISOString();
}
