-- Run this SQL in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)

-- Create agents table
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  personality text not null,
  instructions text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.agents enable row level security;

-- RLS Policies for agents
create policy "Users can view their own agents"
  on public.agents for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own agents"
  on public.agents for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own agents"
  on public.agents for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own agents"
  on public.agents for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.conversations enable row level security;

-- RLS Policies for conversations
create policy "Users can view their own conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own conversations"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.conversations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on public.conversations for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- RLS Policies for messages
create policy "Users can view messages from their conversations"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in their conversations"
  on public.messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );
