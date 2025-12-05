-- Fix the notifications INSERT policy - remove overly permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a more restrictive policy that only allows service role to insert
-- (service role bypasses RLS anyway, but this documents the intent and blocks client access)
CREATE POLICY "Only service role can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (false);

-- Note: Edge functions using service role key will bypass RLS and can still insert
-- This effectively blocks all client-side INSERT attempts