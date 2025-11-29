import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, MessageCircle, Save, Users, Zap, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-ai-brain.jpg";
import iconCreate from "@/assets/icon-create.jpg";
import iconChat from "@/assets/icon-chat.jpg";
import iconSave from "@/assets/icon-save.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Background Image with Low Opacity */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>
        
        {/* Centered Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              AI Agent{" "}
              <span className="text-gradient">Playground</span>
            </h1>
            <h2 className="text-xl lg:text-2xl text-foreground/90 leading-relaxed">
              Build your own AI agents with custom personalities.
              <br />
              Chat with them in realtime.
              <br />
              No code, no chaos — just pure brain power.
            </h2>
            <div className="pt-4">
              <Link to="/agents">
                <Button size="lg" className="text-lg px-8 py-6 glow-cyan hover:scale-105 transition-all">
                  Start Building <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: iconCreate,
              title: "Create Custom Agents",
              description: "Add your own instructions, roles, and behaviours. Make an agent that acts however YOU want."
            },
            {
              icon: iconChat,
              title: "Chat in Realtime",
              description: "Messages update instantly. Feels like WhatsApp but with robots."
            },
            {
              icon: iconSave,
              title: "Saved Automatically",
              description: "Your agents and conversations are stored securely. Never lose your progress."
            }
          ].map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <img src={feature.icon} alt="" className="w-20 h-20 mb-6 rounded-xl" />
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold">
            <Sparkles className="inline mr-3 text-primary" />
            Why AI Agent Playground?
          </h2>
          <p className="text-xl text-muted-foreground">
            Because people don't want a generic AI.
          </p>
          <p className="text-2xl font-semibold text-gradient">
            They want their AI.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your platform lets anyone create a personal AI assistant.
            One that talks, thinks, and behaves exactly how they want.
          </p>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
          Who Is This For?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "🧑‍🎓",
              title: "Students",
              items: ["Explain like I'm 5 teacher", "Math tutor", "Study bestie", "Homework explainer"],
              tagline: "Learn faster, stress less."
            },
            {
              icon: "🧑‍💼",
              title: "Creators & Entrepreneurs",
              items: ["Idea generators", "Caption writers", "Brand-tone assistants", "Research bots"],
              tagline: "Feels like having a team… without paying a team."
            },
            {
              icon: "🧑‍💻",
              title: "Busy Humans",
              items: ["Personal planner", "Schedule maker", "Mood tracker", "To-do buddy"],
              tagline: "Chaos → Organized. Fast."
            },
            {
              icon: "👶",
              title: "Beginners",
              items: ["No coding needed", "Simple setup", "Easy to use", "Quick results"],
              tagline: "AI Agents without writing a single line of code."
            }
          ].map((audience, index) => (
            <Card
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 space-y-4"
            >
              <div className="text-5xl mb-4">{audience.icon}</div>
              <h3 className="text-2xl font-bold">{audience.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {audience.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-primary pt-2 border-t border-border/50">
                {audience.tagline}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
          <Zap className="inline mr-3 text-secondary" />
          Key Features
        </h2>
        <div className="max-w-5xl mx-auto space-y-12">
          {[
            {
              icon: <Brain className="w-8 h-8 text-primary" />,
              title: "Build Your Own AI Agent",
              description: "Pick a personality → Add goals → Done. Your agent instantly becomes an AI with a unique vibe."
            },
            {
              icon: <MessageCircle className="w-8 h-8 text-secondary" />,
              title: "Conversation Memory",
              description: "Agents remember past chats. Feels personal… not robotic."
            },
            {
              icon: "🎭",
              title: "Personality Shaping",
              description: "Give your agent tone, style, humor, strictness, or kindness. You control the vibe."
            },
            {
              icon: "🤖",
              title: "Actions & Behaviors",
              description: "Add instructions like: 'Act like a drill sergeant' or 'Talk like a calm therapist' or 'Help me stay productive.'"
            },
            {
              icon: <Users className="w-8 h-8 text-primary" />,
              title: "Share Your Agents",
              description: "Soon: a marketplace where users share their creations."
            }
          ].map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 AI Agent Playground</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
