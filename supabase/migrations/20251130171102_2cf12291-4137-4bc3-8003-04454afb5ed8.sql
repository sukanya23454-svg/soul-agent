-- Create user_profiles table for public profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create agent_comments table
CREATE TABLE IF NOT EXISTS public.agent_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on agent_comments
ALTER TABLE public.agent_comments ENABLE ROW LEVEL SECURITY;

-- Policies for agent_comments
CREATE POLICY "Anyone can view comments on public agents"
  ON public.agent_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_comments.agent_id 
    AND agents.is_public = true
  ));

CREATE POLICY "Authenticated users can create comments"
  ON public.agent_comments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.agent_comments FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.agent_comments FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create agent_likes table
CREATE TABLE IF NOT EXISTS public.agent_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

-- Enable RLS on agent_likes
ALTER TABLE public.agent_likes ENABLE ROW LEVEL SECURITY;

-- Policies for agent_likes
CREATE POLICY "Anyone can view likes on public agents"
  ON public.agent_likes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_likes.agent_id 
    AND agents.is_public = true
  ));

CREATE POLICY "Authenticated users can like agents"
  ON public.agent_likes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can unlike agents"
  ON public.agent_likes FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Policies for user_follows
CREATE POLICY "Anyone can view follows"
  ON public.user_follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid()::text = follower_id);

CREATE POLICY "Users can unfollow others"
  ON public.user_follows FOR DELETE
  USING (auth.uid()::text = follower_id);

-- Create activity_feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  target_user_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity_feed
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Policies for activity_feed
CREATE POLICY "Anyone can view public activity"
  ON public.activity_feed FOR SELECT
  USING (true);

CREATE POLICY "System can insert activity"
  ON public.activity_feed FOR INSERT
  WITH CHECK (true);

-- Add like_count to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_comments_agent_id ON public.agent_comments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_comments_user_id ON public.agent_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_likes_agent_id ON public.agent_likes(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_likes_user_id ON public.agent_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);

-- Update messages RLS to allow viewing messages for public agents
DROP POLICY IF EXISTS "Users can view messages from their agents" ON public.messages;

CREATE POLICY "Users can view messages from their agents or public agents"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = messages.agent_id 
      AND (agents.user_id = auth.uid()::text OR agents.is_public = true)
    )
  );

-- Update messages RLS to allow creating messages for public agents
DROP POLICY IF EXISTS "Users can create messages for their agents" ON public.messages;

CREATE POLICY "Users can create messages for their agents or public agents"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = messages.agent_id 
      AND (agents.user_id = auth.uid()::text OR agents.is_public = true)
    )
  );

-- Function to update like count
CREATE OR REPLACE FUNCTION public.update_agent_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.agents
    SET like_count = like_count + 1
    WHERE id = NEW.agent_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.agents
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.agent_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to update like count
DROP TRIGGER IF EXISTS update_agent_like_count_trigger ON public.agent_likes;
CREATE TRIGGER update_agent_like_count_trigger
AFTER INSERT OR DELETE ON public.agent_likes
FOR EACH ROW EXECUTE FUNCTION public.update_agent_like_count();