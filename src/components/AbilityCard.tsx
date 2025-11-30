import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Ability } from "@/integrations/supabase/database.types";

interface AbilityCardProps {
  ability: Ability;
  selected: boolean;
  onToggle: () => void;
}

const AbilityCard = ({ ability, selected, onToggle }: AbilityCardProps) => {
  const IconComponent = ability.icon
    ? (LucideIcons as any)[ability.icon]
    : LucideIcons.Sparkles;

  return (
    <Card
      onClick={onToggle}
      className={`
        relative p-4 cursor-pointer transition-all duration-300
        hover:scale-105 hover:glow-subtle
        ${selected 
          ? "border-primary bg-primary/5 ring-2 ring-primary/50" 
          : "border-border/50 hover:border-primary/30"
        }
      `}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${selected ? "bg-primary/20" : "bg-muted/50"}
        `}>
          <IconComponent className={`w-6 h-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-1 text-sm">{ability.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {ability.description}
          </p>
          <Badge 
            variant="secondary" 
            className="mt-2 text-xs capitalize"
          >
            {ability.category}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default AbilityCard;