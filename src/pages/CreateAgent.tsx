import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import CreateAgentWizard from "@/components/CreateAgentWizard";
import AgentActionDialog from "@/components/AgentActionDialog";

const CreateAgent = () => {
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  const [createdAgentName, setCreatedAgentName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleWizardComplete = (agentId: string, agentName: string) => {
    setCreatedAgentId(agentId);
    setCreatedAgentName(agentName);
    setShowActionDialog(true);
  };

  const handleKeepAgent = async (makePublic: boolean) => {
    if (!createdAgentId) return;

    try {
      if (makePublic) {
        await supabase
          .from("agents")
          .update({
            is_public: true,
            published_at: new Date().toISOString(),
          })
          .eq("id", createdAgentId);

        toast({
          title: "Success!",
          description: "Your agent has been published to the marketplace.",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your AI agent has been created.",
        });
      }

      navigate("/agents");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgent = async () => {
    if (!createdAgentId) return;

    try {
      await supabase.from("agents").delete().eq("id", createdAgentId);

      toast({
        title: "Agent deleted",
        description: "The agent has been removed.",
      });

      navigate("/agents");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link to="/agents">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        </Link>

        <CreateAgentWizard
          onComplete={handleWizardComplete}
          onCancel={() => navigate("/agents")}
        />

        <AgentActionDialog
          open={showActionDialog}
          onKeep={handleKeepAgent}
          onDelete={handleDeleteAgent}
          agentName={createdAgentName}
        />
      </div>
    </div>
  );
};

export default CreateAgent;
