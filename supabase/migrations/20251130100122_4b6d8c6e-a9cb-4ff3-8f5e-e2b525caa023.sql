-- Fix search_path for update_agent_rating_stats function
CREATE OR REPLACE FUNCTION update_agent_rating_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.agents
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.agent_ratings
      WHERE agent_id = NEW.agent_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.agent_ratings
      WHERE agent_id = NEW.agent_id
    )
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$;