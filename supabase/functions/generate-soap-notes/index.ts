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
    const { appointmentId, intakeData, consultationTranscript } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify user is a doctor for this appointment
    const { data: appointment } = await supabaseClient
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single();

    if (!appointment) {
      throw new Error('Appointment not found or unauthorized');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an AI assistant helping doctors create SOAP notes. Based on the patient intake data and consultation transcript, generate a structured SOAP note with the following sections:

SUBJECTIVE: Patient's reported symptoms, concerns, and history
OBJECTIVE: Observable findings, vital signs, physical examination
ASSESSMENT: Clinical impression and differential diagnosis  
PLAN: Treatment plan, medications, follow-up recommendations

Format as JSON with clear sections. Be professional and medically accurate.`;

    const prompt = `
Patient Intake Data:
${JSON.stringify(intakeData, null, 2)}

Consultation Transcript:
${consultationTranscript || 'No transcript available'}

Generate a comprehensive SOAP note based on this information.`;

    console.log('Generating SOAP notes for appointment:', appointmentId);

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
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const soapContent = data.choices[0].message.content;

    console.log('Generated SOAP notes');

    // Parse the SOAP content to extract sections
    const soapSections = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    };

    try {
      const parsedSoap = JSON.parse(soapContent);
      Object.assign(soapSections, parsedSoap);
    } catch {
      // If not valid JSON, parse manually
      const lines = soapContent.split('\n');
      let currentSection = '';
      
      lines.forEach(line => {
        if (line.toLowerCase().includes('subjective:')) {
          currentSection = 'subjective';
        } else if (line.toLowerCase().includes('objective:')) {
          currentSection = 'objective';
        } else if (line.toLowerCase().includes('assessment:')) {
          currentSection = 'assessment';
        } else if (line.toLowerCase().includes('plan:')) {
          currentSection = 'plan';
        } else if (currentSection && line.trim()) {
          soapSections[currentSection] += line + '\n';
        }
      });
    }

    // Store SOAP notes in database
    const { data: soapNote, error: insertError } = await supabaseClient
      .from('soap_notes')
      .insert({
        appointment_id: appointmentId,
        doctor_id: user.id,
        subjective: soapSections.subjective,
        objective: soapSections.objective,
        assessment: soapSections.assessment,
        plan: soapSections.plan,
        ai_generated_draft: { original_response: soapContent },
        is_ai_assisted: true,
        is_finalized: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing SOAP notes:', insertError);
      throw new Error('Failed to store SOAP notes');
    }

    return new Response(JSON.stringify({ 
      soapNote,
      sections: soapSections 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating SOAP notes:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});