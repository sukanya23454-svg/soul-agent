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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing automations...');

    // Get all active automations that are due to run
    const now = new Date().toISOString();
    const { data: automations, error: automationsError } = await supabase
      .from('agent_automations')
      .select('*, agents(*)')
      .eq('is_active', true)
      .or(`next_run_at.is.null,next_run_at.lte.${now}`);

    if (automationsError) {
      console.error('Error fetching automations:', automationsError);
      throw automationsError;
    }

    console.log(`Found ${automations?.length || 0} automations to process`);

    const results = [];

    for (const automation of automations || []) {
      try {
        console.log(`Processing automation: ${automation.name} (${automation.id})`);

        const agent = automation.agents;
        if (!agent) {
          console.error(`Agent not found for automation ${automation.id}`);
          continue;
        }

        // Process based on action type
        switch (automation.action_type) {
          case 'send_message': {
            const message = automation.action_config?.message || 'Hello! This is your scheduled message.';
            
            // Insert user message (from automation)
            await supabase
              .from('messages')
              .insert({
                agent_id: automation.agent_id,
                role: 'user',
                content: `[Automated] ${message}`
              });

            // Get agent response if Groq is configured
            if (groqApiKey) {
              // Get recent messages for context
              const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .eq('agent_id', automation.agent_id)
                .order('created_at', { ascending: false })
                .limit(10);

              const chronMessages = messages?.reverse() || [];

              // Build system prompt
              const systemPrompt = `You are ${agent.name}. ${agent.description}\n\nPersonality: ${agent.personality}\n\nInstructions: ${agent.instructions}`;

              // Call Groq
              const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${groqApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages: [
                    { role: 'system', content: systemPrompt },
                    ...chronMessages.map(m => ({
                      role: m.role === 'agent' ? 'assistant' : m.role,
                      content: m.content
                    })),
                    { role: 'user', content: `[Automated] ${message}` }
                  ],
                  temperature: 0.7,
                  max_tokens: 512,
                }),
              });

              if (groqResponse.ok) {
                const groqData = await groqResponse.json();
                const assistantMessage = groqData.choices[0]?.message?.content;

                if (assistantMessage) {
                  await supabase
                    .from('messages')
                    .insert({
                      agent_id: automation.agent_id,
                      role: 'agent',
                      content: assistantMessage
                    });
                }
              }
            }
            break;
          }

          case 'summarize_chat': {
            // Get today's messages
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            
            const { data: todayMessages } = await supabase
              .from('messages')
              .select('*')
              .eq('agent_id', automation.agent_id)
              .gte('created_at', todayStart.toISOString())
              .order('created_at', { ascending: true });

            if (todayMessages && todayMessages.length > 0 && groqApiKey) {
              // Generate summary
              const conversationText = todayMessages
                .map(m => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`)
                .join('\n');

              const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${groqApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are a helpful assistant that creates concise summaries of conversations.'
                    },
                    {
                      role: 'user',
                      content: `Please create a brief summary of today's conversation:\n\n${conversationText}`
                    }
                  ],
                  temperature: 0.5,
                  max_tokens: 300,
                }),
              });

              if (groqResponse.ok) {
                const groqData = await groqResponse.json();
                const summary = groqData.choices[0]?.message?.content;

                if (summary) {
                  // Save as agent memory
                  await supabase
                    .from('agent_memories')
                    .insert({
                      agent_id: automation.agent_id,
                      memory_type: 'summary',
                      content: `Daily summary (${new Date().toLocaleDateString()}): ${summary}`,
                      importance: 7
                    });

                  // Also send as message
                  await supabase
                    .from('messages')
                    .insert({
                      agent_id: automation.agent_id,
                      role: 'agent',
                      content: `📊 Daily Summary:\n\n${summary}`
                    });
                }
              }
            }
            break;
          }

          case 'reminder': {
            const reminderText = automation.action_config?.reminder || 'This is your scheduled reminder!';
            
            await supabase
              .from('messages')
              .insert({
                agent_id: automation.agent_id,
                role: 'agent',
                content: `⏰ Reminder: ${reminderText}`
              });
            break;
          }

          case 'auto_save_notes': {
            // Get recent user messages
            const { data: recentMessages } = await supabase
              .from('messages')
              .select('*')
              .eq('agent_id', automation.agent_id)
              .eq('role', 'user')
              .order('created_at', { ascending: false })
              .limit(5);

            if (recentMessages && recentMessages.length > 0) {
              for (const msg of recentMessages) {
                // Check if it looks like an important note (contains keywords)
                const keywords = ['remember', 'note', 'important', 'don\'t forget', 'remind me'];
                const hasKeyword = keywords.some(kw => msg.content.toLowerCase().includes(kw));

                if (hasKeyword) {
                  await supabase
                    .from('agent_memories')
                    .insert({
                      agent_id: automation.agent_id,
                      memory_type: 'fact',
                      content: msg.content,
                      importance: 6
                    });
                }
              }
            }
            break;
          }
        }

        // Calculate next run time
        const nextRun = calculateNextRun(automation.frequency, automation.time_of_day);
        
        // Update automation
        await supabase
          .from('agent_automations')
          .update({
            last_run_at: now,
            next_run_at: nextRun
          })
          .eq('id', automation.id);

        results.push({ id: automation.id, status: 'success' });
        console.log(`Successfully processed automation: ${automation.name}`);
      } catch (error: any) {
        console.error(`Error processing automation ${automation.id}:`, error);
        results.push({ id: automation.id, status: 'error', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-automations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function calculateNextRun(frequency: string, timeOfDay: string | null): string {
  const now = new Date();
  let nextRun = new Date(now);

  // Parse time of day if provided
  let targetHour = 9; // default 9 AM
  let targetMinute = 0;
  if (timeOfDay) {
    const [hours, minutes] = timeOfDay.split(':');
    targetHour = parseInt(hours);
    targetMinute = parseInt(minutes);
  }

  switch (frequency) {
    case 'hourly':
      nextRun.setHours(now.getHours() + 1);
      break;
    case 'every_3_hours':
      nextRun.setHours(now.getHours() + 3);
      break;
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + 7);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
      break;
    default:
      // Default to daily
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(targetHour, targetMinute, 0, 0);
  }

  return nextRun.toISOString();
}
