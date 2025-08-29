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
    const { symptomsData, patientHistory } = await req.json();
    
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

    const systemPrompt = `You are an AI medical triage classifier. Based on patient symptoms and history, classify the urgency level as:

EMERGENCY: Life-threatening symptoms requiring immediate attention
- Chest pain with cardiac symptoms
- Severe difficulty breathing
- Signs of stroke
- Severe allergic reactions
- Heavy bleeding
- Loss of consciousness

URGENT: Serious symptoms requiring prompt care within hours
- High fever with concerning symptoms
- Severe pain
- Persistent vomiting
- Signs of infection
- Mental health crisis

ROUTINE: Non-urgent symptoms for regular appointment
- Mild symptoms
- Follow-up care
- Preventive care
- Chronic condition management

Respond ONLY with JSON in this format:
{
  "priority": "routine|urgent|emergency",
  "rationale": "Clear explanation of classification reasoning",
  "redFlags": ["list", "of", "concerning", "symptoms"],
  "recommendations": "Next steps for patient care"
}`;

    const prompt = `
Patient Symptoms: ${JSON.stringify(symptomsData, null, 2)}
Patient History: ${JSON.stringify(patientHistory, null, 2)}

Classify this case and provide reasoning.`;

    console.log('Classifying triage priority');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const triageResponse = data.choices[0].message.content;

    console.log('Received triage classification');

    let triageResult;
    try {
      triageResult = JSON.parse(triageResponse);
    } catch (parseError) {
      console.error('Failed to parse triage response:', parseError);
      // Fallback classification
      triageResult = {
        priority: 'routine',
        rationale: 'Unable to classify automatically - requires manual review',
        redFlags: [],
        recommendations: 'Manual review required'
      };
    }

    // Update AI intake response with triage classification
    const { error: updateError } = await supabaseClient
      .from('ai_intake_responses')
      .update({
        triage_priority: triageResult.priority,
        triage_rationale: triageResult.rationale,
        symptoms_summary: {
          ...symptomsData,
          red_flags: triageResult.redFlags,
          recommendations: triageResult.recommendations
        }
      })
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('Error updating triage classification:', updateError);
    }

    return new Response(JSON.stringify(triageResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in triage classification:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});