-- Enable pg_cron extension for scheduled jobs
create extension if not exists pg_cron with schema extensions;

-- Enable pg_net extension for HTTP requests
create extension if not exists pg_net with schema extensions;

-- Schedule the process-automations function to run every 15 minutes
select cron.schedule(
  'process-agent-automations',
  '*/15 * * * *',
  $$
  select net.http_post(
    url:='https://rkypiocczfhoawzpufui.supabase.co/functions/v1/process-automations',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreXBpb2NjemZob2F3enB1ZnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDM2NTMsImV4cCI6MjA4MDAxOTY1M30.3R9KW-Eh1nGVsYjUIKffJGw7ZCqT9uW9qXZL_vWvZZ0"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);