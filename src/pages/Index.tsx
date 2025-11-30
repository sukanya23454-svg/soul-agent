import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Brain, Sparkles, Zap, Calendar, 
  FileText, Heart, Lightbulb, Target, MessageSquare,
  Shield, Globe, Rocket
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="mx-auto w-fit px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Universal AI Agent Platform
            </Badge>
            
            <h1 className="text-6xl lg:text-8xl font-bold leading-tight tracking-tight">
              Your AI.
              <br />
              <span className="text-gradient">Your Rules.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Create powerful AI agents with custom abilities, personalities, and memory.
              No code. No limits. Built for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-7 glow-cyan hover:scale-105 transition-all group">
                  Start Building Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              {[
                { number: "12+", label: "Built-in Skills" },
                { number: "∞", label: "Possibilities" },
                { number: "100%", label: "Free to Start" }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-4xl font-bold text-gradient">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Abilities Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-bold">
            <Zap className="inline text-secondary mr-3" />
            Powerful Abilities
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Give your agents superpowers. Mix and match skills to create the perfect assistant.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {[
            { icon: FileText, name: "Summarize", color: "text-blue-400" },
            { icon: Lightbulb, name: "Explain Simply", color: "text-yellow-400" },
            { icon: Sparkles, name: "Create Content", color: "text-purple-400" },
            { icon: Target, name: "Plan Tasks", color: "text-green-400" },
            { icon: Brain, name: "Research", color: "text-cyan-400" },
            { icon: Heart, name: "Motivate", color: "text-pink-400" },
            { icon: Calendar, name: "Schedule", color: "text-orange-400" },
            { icon: Zap, name: "Brainstorm", color: "text-indigo-400" }
          ].map((ability, index) => (
            <Card
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:glow-subtle group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ability.icon className={`w-7 h-7 ${ability.color}`} />
                </div>
                <h3 className="font-semibold">{ability.name}</h3>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-32 bg-gradient-to-b from-background to-muted/10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-bold">Built for Everyone</h2>
          <p className="text-xl text-muted-foreground">
            From students to entrepreneurs. From beginners to experts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            {
              emoji: "🎓",
              title: "Students",
              description: "Study smarter with AI tutors that explain concepts simply",
              examples: ["Math helper", "Language tutor", "Study planner"]
            },
            {
              emoji: "💼",
              title: "Professionals",
              description: "Boost productivity with AI assistants for work tasks",
              examples: ["Email writer", "Meeting notes", "Task manager"]
            },
            {
              emoji: "🎨",
              title: "Creators",
              description: "Generate content and ideas faster than ever",
              examples: ["Social posts", "Blog writer", "Idea generator"]
            },
            {
              emoji: "💪",
              title: "Health & Fitness",
              description: "Stay motivated and track your wellness journey",
              examples: ["Workout plans", "Habit tracker", "Meal planner"]
            }
          ].map((useCase, index) => (
            <Card
              key={index}
              className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 space-y-4"
            >
              <div className="text-6xl mb-4">{useCase.emoji}</div>
              <h3 className="text-2xl font-bold">{useCase.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {useCase.description}
              </p>
              <div className="space-y-2 pt-2 border-t border-border/50">
                {useCase.examples.map((example, i) => (
                  <div key={i} className="text-xs text-primary flex items-center">
                    <span className="mr-2">→</span>
                    {example}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold mb-4">
            Why Choose Our Platform?
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            {
              icon: Shield,
              title: "Memory System",
              description: "Your agents remember important details across conversations. Build long-term relationships with AI that learns and grows."
            },
            {
              icon: Globe,
              title: "Modular Skills",
              description: "Choose from 12+ pre-built abilities or combine them. Create the exact assistant you need, nothing more, nothing less."
            },
            {
              icon: Rocket,
              title: "Advanced Features",
              description: "Automations, multi-agent collaboration, and file analysis coming soon. Start simple, scale infinitely."
            }
          ].map((feature, index) => (
            <Card
              key={index}
              className="p-10 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <Card className="max-w-4xl mx-auto p-16 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 backdrop-blur-sm border-primary/20 text-center space-y-8">
          <MessageSquare className="w-16 h-16 mx-auto text-primary animate-float" />
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to Build Your AI Team?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands creating custom AI agents. No credit card required.
          </p>
          <Link to="/auth" className="mt-6">
            <Button size="lg" className="text-lg px-10 py-7 glow-cyan hover:scale-105 transition-all">
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-20">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
            <Brain className="text-primary" />
            <span className="text-gradient">AI Agent Platform</span>
          </div>
          <p className="text-muted-foreground">
            Building the future of AI assistance, together.
          </p>
          <p className="text-sm text-muted-foreground/60">© 2025 All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;