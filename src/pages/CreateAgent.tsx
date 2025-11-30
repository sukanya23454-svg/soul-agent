import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import AbilitiesSelector from "@/components/AbilitiesSelector";

const CreateAgent = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Create the agent
      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .insert({
          user_id: session.user.id,
          name,
          description,
          personality,
          instructions,
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Add selected abilities
      if (selectedAbilities.length > 0 && agent) {
        const abilityInserts = selectedAbilities.map(abilityId => ({
          agent_id: agent.id,
          ability_id: abilityId,
        }));

        const { error: abilitiesError } = await supabase
          .from("agent_abilities")
          .insert(abilityInserts);

        if (abilitiesError) throw abilitiesError;
      }

      toast({
        title: "Success!",
        description: "Your AI agent has been created with selected abilities.",
      });

      navigate("/agents");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

        <Card className="max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Create AI Agent</h1>
              <p className="text-muted-foreground">
                Build your custom AI with personality and purpose
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Name</label>
                <Input
                  placeholder="e.g., Study Buddy, Coach Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description of your agent"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Personality</label>
                <Textarea
                  placeholder="e.g., Friendly and encouraging, Professional and direct, Sarcastic but helpful"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  required
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  placeholder="What should this agent do? How should it behave? What's its role?"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  required
                  className="bg-background/50 min-h-[150px]"
                />
              </div>

              <div className="pt-4 border-t border-border/50">
                <AbilitiesSelector
                  selectedAbilities={selectedAbilities}
                  onAbilitiesChange={setSelectedAbilities}
                />
              </div>

              <Button
                type="submit"
                className="w-full glow-cyan"
                disabled={loading}
                size="lg"
              >
                {loading ? "Creating..." : "Create Agent"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateAgent;
