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
    const { appointmentId, diagnosis, symptoms, patientAllergies } = await req.json();
    
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
      .select('*, patient:profiles!appointments_patient_id_fkey(*)')
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

    const systemPrompt = `You are an AI assistant helping doctors create prescription drafts. Based on the diagnosis and symptoms, suggest appropriate medications with proper dosages, frequencies, and durations.

IMPORTANT: 
- This is a DRAFT only - doctor must review and approve
- Consider patient allergies carefully
- Provide generic medication names
- Include clear dosing instructions
- Add relevant warnings and contraindications

Respond ONLY with JSON in this format:
{
  "medications": [
    {
      "name": "Medication Name",
      "dosage": "Amount per dose",
      "frequency": "How often",
      "duration": "How long",
      "instructions": "Special instructions",
      "warnings": "Important warnings"
    }
  ],
  "generalInstructions": "Overall care instructions",
  "warnings": "Important safety information",
  "followUp": "When to return or follow up"
}`;

    const prompt = `
Diagnosis: ${diagnosis}
Symptoms: ${JSON.stringify(symptoms, null, 2)}
Patient Allergies: ${patientAllergies || 'None reported'}
Patient Age: ${appointment.patient?.date_of_birth ? 
  Math.floor((new Date().getTime() - new Date(appointment.patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365)) 
  : 'Not specified'}

Generate appropriate prescription draft considering allergies and patient profile.`;

    console.log('Generating prescription draft for appointment:', appointmentId);

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
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const prescriptionContent = data.choices[0].message.content;

    console.log('Generated prescription draft');

    let prescriptionData;
    try {
      prescriptionData = JSON.parse(prescriptionContent);
    } catch (parseError) {
      console.error('Failed to parse prescription response:', parseError);
      throw new Error('Failed to generate valid prescription format');
    }

    // Store prescription draft in database
    const { data: prescription, error: insertError } = await supabaseClient
      .from('prescriptions')
      .insert({
        appointment_id: appointmentId,
        doctor_id: user.id,
        patient_id: appointment.patient_id,
        medications: prescriptionData.medications,
        instructions: `${prescriptionData.generalInstructions}\n\nWarnings: ${prescriptionData.warnings}\n\nFollow-up: ${prescriptionData.followUp}`,
        ai_generated_draft: { original_response: prescriptionContent },
        is_ai_assisted: true,
        is_signed: false,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing prescription:', insertError);
      throw new Error('Failed to store prescription');
    }

    return new Response(JSON.stringify({ 
      prescription,
      prescriptionData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating prescription:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});