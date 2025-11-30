import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId } = await req.json();
    console.log('Analyzing file:', fileId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get file details
    const { data: fileData, error: fileError } = await supabaseClient
      .from('agent_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      throw new Error('File not found');
    }

    // Update status to processing
    await supabaseClient
      .from('agent_files')
      .update({ analysis_status: 'processing' })
      .eq('id', fileId);

    // Download file from storage
    const { data: fileBlob, error: downloadError } = await supabaseClient
      .storage
      .from('agent-files')
      .download(fileData.file_path);

    if (downloadError || !fileBlob) {
      throw new Error('Failed to download file');
    }

    // Extract text based on file type
    let extractedText = '';
    
    if (fileData.file_type === 'text/plain' || fileData.file_type === 'text/markdown') {
      extractedText = await fileBlob.text();
    } else if (fileData.file_type === 'application/pdf') {
      // For PDFs, we'll create a summary without full text extraction for now
      extractedText = `PDF file: ${fileData.file_name}. Size: ${fileData.file_size} bytes.`;
    } else if (fileData.file_type.startsWith('image/')) {
      extractedText = `Image file: ${fileData.file_name}. Type: ${fileData.file_type}`;
    }

    // Analyze with Groq
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a file analysis assistant. Analyze the provided file content and create a concise summary with key insights. Keep it under 200 words.'
          },
          {
            role: 'user',
            content: `Analyze this file:\n\nFilename: ${fileData.file_name}\nType: ${fileData.file_type}\n\nContent:\n${extractedText.substring(0, 4000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error('Failed to analyze file with AI');
    }

    const groqData = await groqResponse.json();
    const analysisSummary = groqData.choices[0].message.content;

    // Update file with analysis
    await supabaseClient
      .from('agent_files')
      .update({ 
        analysis_status: 'completed',
        analysis_summary: analysisSummary
      })
      .eq('id', fileId);

    // Create memory entry for the agent
    await supabaseClient
      .from('agent_memories')
      .insert({
        agent_id: fileData.agent_id,
        memory_type: 'context',
        content: `File uploaded: ${fileData.file_name}\n\nAnalysis: ${analysisSummary}`,
        importance: 7
      });

    console.log('File analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        summary: analysisSummary 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error analyzing file:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});