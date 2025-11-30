import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AgentActionDialogProps {
  open: boolean;
  onKeep: (makePublic: boolean) => void;
  onDelete: () => void;
  agentName: string;
}

const AgentActionDialog = ({ open, onKeep, onDelete, agentName }: AgentActionDialogProps) => {
  const [makePublic, setMakePublic] = useState(false);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>What would you like to do with {agentName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>You've successfully created your agent. Choose what to do next:</p>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="make-public" className="text-sm font-medium">
                  Publish to Marketplace
                </Label>
                <p className="text-xs text-muted-foreground">
                  Let others discover and clone your agent
                </p>
              </div>
              <Switch
                id="make-public"
                checked={makePublic}
                onCheckedChange={setMakePublic}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="destructive" onClick={onDelete}>
              Delete Agent
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={() => onKeep(makePublic)}>
              Keep Agent
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AgentActionDialog;
