import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AbilityCard from "./AbilityCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Ability } from "@/integrations/supabase/database.types";

interface AbilitiesSelectorProps {
  selectedAbilities: string[];
  onAbilitiesChange: (abilityIds: string[]) => void;
}

const AbilitiesSelector = ({ selectedAbilities, onAbilitiesChange }: AbilitiesSelectorProps) => {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        const { data, error } = await supabase
          .from("abilities")
          .select("*")
          .order("category", { ascending: true });

        if (error) throw error;
        setAbilities(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load abilities",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAbilities();
  }, [toast]);

  const toggleAbility = (abilityId: string) => {
    if (selectedAbilities.includes(abilityId)) {
      onAbilitiesChange(selectedAbilities.filter(id => id !== abilityId));
    } else {
      onAbilitiesChange([...selectedAbilities, abilityId]);
    }
  };

  const categories = [...new Set(abilities.map(a => a.category))];

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading abilities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Abilities</h3>
          <p className="text-sm text-muted-foreground">
            Select skills your agent should have ({selectedAbilities.length} selected)
          </p>
        </div>
      </div>

      <Tabs defaultValue={categories[0] || "all"} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {abilities.map(ability => (
              <AbilityCard
                key={ability.id}
                ability={ability}
                selected={selectedAbilities.includes(ability.id)}
                onToggle={() => toggleAbility(ability.id)}
              />
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {abilities
                .filter(a => a.category === category)
                .map(ability => (
                  <AbilityCard
                    key={ability.id}
                    ability={ability}
                    selected={selectedAbilities.includes(ability.id)}
                    onToggle={() => toggleAbility(ability.id)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AbilitiesSelector;