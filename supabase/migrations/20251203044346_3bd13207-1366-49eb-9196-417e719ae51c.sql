-- Allow users to delete messages from their agents or public agents they chat with
CREATE POLICY "Users can delete messages from their agents"
ON public.messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM agents
  WHERE agents.id = messages.agent_id
  AND agents.user_id = (auth.uid())::text
));