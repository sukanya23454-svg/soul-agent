-- Create agent_automations table
create table if not exists public.agent_automations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  user_id text not null,
  name text not null,
  description text,
  frequency text not null, -- cron expression or simple frequency like 'daily', 'weekly'
  time_of_day time, -- specific time like 08:00:00
  action_type text not null check (action_type in ('send_message', 'summarize_chat', 'reminder', 'auto_save_notes')),
  action_config jsonb default '{}'::jsonb,
  is_active boolean default true,
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.agent_automations enable row level security;

-- RLS Policies
create policy "Users can view their own automations"
  on public.agent_automations for select
  to authenticated
  using (auth.uid()::text = user_id);

create policy "Users can create automations for their agents"
  on public.agent_automations for insert
  to authenticated
  with check (
    auth.uid()::text = user_id
    and exists (
      select 1 from public.agents
      where agents.id = agent_automations.agent_id
      and agents.user_id = auth.uid()::text
    )
  );

create policy "Users can update their own automations"
  on public.agent_automations for update
  to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Users can delete their own automations"
  on public.agent_automations for delete
  to authenticated
  using (auth.uid()::text = user_id);

-- Create index for efficient queries
create index idx_agent_automations_agent_id on public.agent_automations(agent_id);
create index idx_agent_automations_next_run on public.agent_automations(next_run_at) where is_active = true;