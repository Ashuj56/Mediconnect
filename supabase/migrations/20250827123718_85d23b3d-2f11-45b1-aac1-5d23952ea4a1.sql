-- Create RLS policies for appointments
CREATE POLICY "Patients can view their own appointments" ON public.appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their own appointments" ON public.appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update their appointments" ON public.appointments
  FOR UPDATE USING (doctor_id = auth.uid());

-- Create RLS policies for other tables
CREATE POLICY "Users can access their own consultations" ON public.consultations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE appointments.id = consultations.appointment_id 
      AND (patient_id = auth.uid() OR doctor_id = auth.uid())
    )
  );

CREATE POLICY "Users can access their own AI intake" ON public.ai_intake_responses
  FOR ALL USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE appointments.id = ai_intake_responses.appointment_id 
    AND doctor_id = auth.uid()
  ));

CREATE POLICY "Users can access their own SOAP notes" ON public.soap_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE appointments.id = soap_notes.appointment_id 
      AND (patient_id = auth.uid() OR doctor_id = auth.uid())
    )
  );

CREATE POLICY "Users can access their own prescriptions" ON public.prescriptions
  FOR ALL USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Users can access their own payments" ON public.payments
  FOR ALL USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can access their own files" ON public.file_uploads
  FOR ALL USING (uploaded_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE appointments.id = file_uploads.appointment_id 
    AND (patient_id = auth.uid() OR doctor_id = auth.uid())
  ));

-- Create doctor availability policies
CREATE POLICY "Doctors can manage their own availability" ON public.doctor_availability
  FOR ALL USING (doctor_id = auth.uid());

CREATE POLICY "Anyone can view doctor availability" ON public.doctor_availability
  FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_doctor_availability_updated_at
  BEFORE UPDATE ON public.doctor_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_intake_responses_updated_at
  BEFORE UPDATE ON public.ai_intake_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_soap_notes_updated_at
  BEFORE UPDATE ON public.soap_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies
CREATE POLICY "Users can upload their own medical documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile pictures are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own prescriptions" ON storage.objects
  FOR SELECT USING (bucket_id = 'prescription-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctors can upload prescription PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'prescription-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);