import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AgentList from "./pages/AgentList";
import CreateAgent from "./pages/CreateAgent";
import ChatWithAgent from "./pages/ChatWithAgent";
import Files from "./pages/Files";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import ActivityFeed from "./pages/ActivityFeed";
import Leaderboards from "./pages/Leaderboards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agents" element={<AgentList />} />
            <Route path="/create-agent" element={<CreateAgent />} />
            <Route path="/chat/:agentId" element={<ChatWithAgent />} />
            <Route path="/files" element={<Files />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/activity" element={<ActivityFeed />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
