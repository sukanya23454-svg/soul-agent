import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Layers, Sparkles, Zap, Calendar, 
  FileText, TrendingUp, Lightbulb, Target, MessageSquare,
  Database, Users, Rocket
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="mx-auto w-fit px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              Build AI Agents Without Code
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Create AI Agents
              <br />
              <span className="text-gradient">That Actually Work</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Design custom AI assistants with specific skills, personalities, and memory.
              No coding required. Start building in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link to="/auth">
                <Button size="lg" className="text-base px-8 py-6 glow-primary hover:scale-105 transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="lg" className="text-base px-8 py-6">
                  Explore Templates
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto pt-16">
              {[
                { number: "12+", label: "Skills" },
                { number: "Free", label: "To Start" },
                { number: "5min", label: "Setup" }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Abilities Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            Give Your Agents Skills
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mix and match abilities to create the perfect assistant for your needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: FileText, name: "Summarize", desc: "Condense long texts" },
            { icon: Lightbulb, name: "Explain", desc: "Simplify concepts" },
            { icon: Sparkles, name: "Create", desc: "Generate content" },
            { icon: Target, name: "Plan", desc: "Organize tasks" },
            { icon: Layers, name: "Research", desc: "Find information" },
            { icon: TrendingUp, name: "Analyze", desc: "Extract insights" },
            { icon: Calendar, name: "Schedule", desc: "Manage time" },
            { icon: Zap, name: "Brainstorm", desc: "Generate ideas" }
          ].map((ability, index) => (
            <Card
              key={index}
              className="p-5 bg-card border-border hover:border-primary/30 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex flex-col items-start space-y-2">
                <ability.icon className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-sm">{ability.name}</h3>
                <p className="text-xs text-muted-foreground">{ability.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">Built for Everyone</h2>
          <p className="text-muted-foreground">
            From students to professionals, there's an agent for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Students",
              description: "Study smarter with AI tutors that explain concepts your way",
              examples: ["Math helper", "Language tutor", "Study planner"]
            },
            {
              title: "Professionals",
              description: "Boost productivity with assistants for everyday work tasks",
              examples: ["Email writer", "Meeting notes", "Task manager"]
            },
            {
              title: "Creators",
              description: "Generate content and ideas faster than ever before",
              examples: ["Social posts", "Blog writer", "Idea generator"]
            },
            {
              title: "Wellness",
              description: "Stay motivated and track your health journey",
              examples: ["Workout plans", "Habit tracker", "Meal planner"]
            }
          ].map((useCase, index) => (
            <Card
              key={index}
              className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-200 space-y-4"
            >
              <h3 className="text-lg font-semibold">{useCase.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {useCase.description}
              </p>
              <div className="space-y-1.5 pt-3 border-t border-border">
                {useCase.examples.map((example, i) => (
                  <div key={i} className="text-xs text-primary/80 flex items-center">
                    <span className="mr-2 text-primary">→</span>
                    {example}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Why Choose Us?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Database,
              title: "Persistent Memory",
              description: "Your agents remember important details across all conversations and learn your preferences."
            },
            {
              icon: Users,
              title: "Modular Design",
              description: "Choose from 12+ pre-built skills. Create exactly the assistant you need, nothing more."
            },
            {
              icon: Rocket,
              title: "Growing Platform",
              description: "Automations, team collaboration, and advanced features. Start simple, scale as needed."
            }
          ].map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-card border-border hover:border-primary/30 transition-all duration-200 space-y-4"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="max-w-2xl mx-auto p-10 md:p-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 text-center space-y-6">
          <MessageSquare className="w-10 h-10 mx-auto text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Build Your First Agent?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join others creating custom AI assistants. No credit card needed.
          </p>
          <div className="pt-4">
            <Link to="/auth">
              <Button size="lg" className="text-base px-8 py-6 glow-primary hover:scale-105 transition-all">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xl font-semibold">
            <Layers className="text-primary w-5 h-5" />
            <span>AgentBuilder</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;