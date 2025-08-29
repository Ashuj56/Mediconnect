import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], patientId } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are MediBot, a professional medical intake assistant for a telemedicine platform. Your role is to:

1. Collect comprehensive patient symptoms and medical history
2. Ask relevant follow-up questions about:
   - Chief complaint and symptoms
   - Duration and severity
   - Associated symptoms
   - Medical history and medications
   - Allergies and previous treatments
   - Pain scale (1-10) where applicable

3. Be empathetic, professional, and thorough
4. Do NOT provide medical advice or diagnoses
5. Once you have sufficient information, summarize findings

Keep responses concise but caring. Ask one focused question at a time.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with messages:', messages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    console.log('Received response from OpenAI');

    // Store conversation in database if patientId provided
    if (patientId) {
      const conversationData = {
        patient_message: message,
        bot_response: botResponse,
        timestamp: new Date().toISOString()
      };

      const { error: insertError } = await supabaseClient
        .from('ai_intake_responses')
        .upsert({
          patient_id: patientId,
          conversation_data: conversationHistory.concat([
            { role: 'user', content: message },
            { role: 'assistant', content: botResponse }
          ]),
          symptoms_summary: {},
          triage_priority: 'routine',
          triage_rationale: 'Initial intake in progress',
        });

      if (insertError) {
        console.error('Error storing conversation:', insertError);
      }
    }

    return new Response(JSON.stringify({ 
      response: botResponse,
      conversationId: patientId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI intake chatbot:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});