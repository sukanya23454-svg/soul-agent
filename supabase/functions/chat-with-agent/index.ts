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

    // Get agent - allow access to own agents OR public agents
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or you do not have access');
    }

    console.log('Agent found:', agent.name, 'Type:', agent.agent_type || 'general');

    // Get agent's abilities
    const { data: agentAbilities, error: abilitiesError } = await supabase
      .from('agent_abilities')
      .select('ability_id, abilities(*)')
      .eq('agent_id', agentId);

    let abilities = agentAbilities?.map((aa: any) => aa.abilities) || [];
    
    // Prioritize abilities matching the agent type
    if (agent.agent_type && agent.agent_type !== 'general') {
      abilities = abilities.sort((a: any, b: any) => {
        const aMatches = a.category === agent.agent_type;
        const bMatches = b.category === agent.agent_type;
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    }
    
    console.log('Agent has', abilities.length, 'abilities');

    // Get recent memories (top 5 most important) - only for agent owner
    let memories = [];
    if (agent.user_id === user.id) {
      const { data: memData } = await supabase
        .from('agent_memories')
        .select('*')
        .eq('agent_id', agentId)
        .order('importance', { ascending: false })
        .limit(5);
      
      memories = memData || [];
      console.log('Retrieved', memories.length, 'memories (owner only)');
    }

    // Get message history for this agent (last 20 messages for context)
    // For public agents, get conversation history for this user only
    let messagesQuery = supabase
      .from('messages')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: messages, error: msgError } = await messagesQuery;

    if (msgError) {
      console.error('Error fetching messages:', msgError);
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
      console.error('Error saving user message:', insertError);
      throw new Error('Failed to save user message');
    }

    // Build enhanced system prompt with abilities and memories
    let systemPrompt = `You are ${agent.name}.`;
    
    if (agent.description) {
      systemPrompt += ` ${agent.description}`;
    }
    
    if (agent.personality) {
      systemPrompt += `\n\nPersonality: ${agent.personality}`;
    }
    
    if (agent.instructions) {
      systemPrompt += `\n\nInstructions: ${agent.instructions}`;
    }

    // Add agent type context
    if (agent.agent_type && agent.agent_type !== 'general') {
      systemPrompt += `\n\nAgent Type: You are specialized as a ${agent.agent_type} agent.`;
    }

    // Add abilities to system prompt
    if (abilities.length > 0) {
      systemPrompt += '\n\nYour Abilities:\n';
      abilities.forEach((ability: any) => {
        systemPrompt += `- ${ability.name}: ${ability.description}\n  ${ability.prompt_template}\n`;
      });
      systemPrompt += '\nUse these abilities when appropriate based on user requests.';
    }

    // Add memories to system prompt (owner only)
    if (memories.length > 0) {
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

    // Auto-create memory for important conversations (every 5th message) - owner only
    if (agent.user_id === user.id) {
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