import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Upload, User, Sparkles, Globe, Lock } from "lucide-react";
import AbilitiesSelector from "@/components/AbilitiesSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateAgentWizardProps {
  onComplete: (agentId: string, agentName: string) => void;
  onCancel: () => void;
}

const CreateAgentWizard = ({ onComplete, onCancel }: CreateAgentWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Step 1: Personality
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [instructions, setInstructions] = useState("");

  // Step 2: Skills
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);

  // Step 3: Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return name && personality && instructions;
    if (currentStep === 2) return true; // Skills are optional
    if (currentStep === 3) return true; // Avatar is optional
    return false;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('agent-files')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('agent-files')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Create agent
      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .insert({
          user_id: session.user.id,
          name,
          description,
          personality,
          instructions,
          avatar_url: avatarUrl,
          is_public: isPublic,
          published_at: isPublic ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Add abilities
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
        description: "Your AI agent has been created.",
      });

      onComplete(agent.id, agent.name);
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
    <Card className="max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Create AI Agent</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Personality Setup */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Personality Setup</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name *</label>
              <Input
                placeholder="e.g., Study Buddy, Coach Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <label className="text-sm font-medium">Personality *</label>
              <Textarea
                placeholder="e.g., Friendly and encouraging, Professional and direct"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="bg-background/50 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions *</label>
              <Textarea
                placeholder="What should this agent do? How should it behave?"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="bg-background/50 min-h-[150px]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Skills Selection */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Select Skills</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose the abilities your agent will have (optional)
            </p>
            <AbilitiesSelector
              selectedAbilities={selectedAbilities}
              onAbilitiesChange={setSelectedAbilities}
            />
          </div>
        )}

        {/* Step 3: Avatar Upload */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload Avatar</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Give your agent a visual identity (optional)
            </p>

            <div className="flex flex-col items-center gap-4">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center bg-muted/30">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-2 mb-4">
              <h3 className="font-semibold">Review Your Agent</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {name}</p>
                <p><span className="text-muted-foreground">Personality:</span> {personality}</p>
                <p><span className="text-muted-foreground">Skills:</span> {selectedAbilities.length} selected</p>
                <p><span className="text-muted-foreground">Avatar:</span> {avatarFile ? "Uploaded" : "None"}</p>
              </div>
            </div>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="publish-toggle" className="font-semibold cursor-pointer">
                      {isPublic ? "Publish to Marketplace" : "Keep Private"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isPublic
                        ? "Anyone can view, chat with, and clone your agent"
                        : "Only you can see and use this agent"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="publish-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handleBack}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="glow-cyan"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="glow-cyan"
            >
              {loading ? "Creating..." : "Create Agent"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CreateAgentWizard;
