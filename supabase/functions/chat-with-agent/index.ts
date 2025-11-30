import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, message } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Processing chat for user:', user.id, 'agent:', agentId);

    // Get agent with abilities
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    // Get agent's abilities
    const { data: agentAbilities, error: abilitiesError } = await supabase
      .from('agent_abilities')
      .select('ability_id, abilities(*)')
      .eq('agent_id', agentId);

    const abilities = agentAbilities?.map((aa: any) => aa.abilities) || [];
    console.log('Agent has', abilities.length, 'abilities');

    // Get recent memories (top 5 most important)
    const { data: memories, error: memoriesError } = await supabase
      .from('agent_memories')
      .select('*')
      .eq('agent_id', agentId)
      .order('importance', { ascending: false })
      .limit(5);

    console.log('Retrieved', memories?.length || 0, 'memories');

    // Get message history for this agent (last 20 messages for context)
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (msgError) {
      throw new Error('Failed to fetch messages');
    }

    // Reverse to get chronological order
    const chronMessages = messages?.reverse() || [];
    console.log('Fetched', chronMessages.length, 'previous messages');

    // Save user message
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        agent_id: agentId,
        role: 'user',
        content: message
      });

    if (insertError) {
      throw new Error('Failed to save user message');
    }

    // Build enhanced system prompt with abilities and memories
    let systemPrompt = `You are ${agent.name}. ${agent.description}\n\nPersonality: ${agent.personality}\n\nInstructions: ${agent.instructions}`;

    // Add abilities to system prompt
    if (abilities.length > 0) {
      systemPrompt += '\n\nYour Abilities:\n';
      abilities.forEach((ability: any) => {
        systemPrompt += `- ${ability.name}: ${ability.prompt_template}\n`;
      });
    }

    // Add memories to system prompt
    if (memories && memories.length > 0) {
      systemPrompt += '\n\nImportant Memories:\n';
      memories.forEach((memory: any) => {
        systemPrompt += `- [${memory.memory_type}] ${memory.content}\n`;
      });
    }

    // Build messages for Groq
    const groqMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...chronMessages.map(m => ({
        role: m.role === 'agent' ? 'assistant' : m.role,
        content: m.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Calling Groq API with', groqMessages.length, 'messages');

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorText);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const assistantMessage = groqData.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from Groq');
    }

    console.log('Got response from Groq, length:', assistantMessage.length);

    // Save assistant message
    const { error: assistantInsertError } = await supabase
      .from('messages')
      .insert({
        agent_id: agentId,
        role: 'agent',
        content: assistantMessage
      });

    if (assistantInsertError) {
      console.error('Failed to save assistant message:', assistantInsertError);
      throw new Error('Failed to save assistant message');
    }

    // Auto-create memory for important conversations (every 5th message)
    const totalMessages = chronMessages.length + 2; // +2 for current user and agent messages
    if (totalMessages % 5 === 0) {
      const memoryContent = `User asked: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}" - Context from conversation`;
      
      await supabase
        .from('agent_memories')
        .insert({
          agent_id: agentId,
          memory_type: 'context',
          content: memoryContent,
          importance: 5
        });
      
      console.log('Created new memory');
    }

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-agent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});