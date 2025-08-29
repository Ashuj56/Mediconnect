-- Add RLS policy to allow patients to view doctor profiles for booking appointments
CREATE POLICY "Patients can view doctor profiles for booking" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (role = 'doctor' AND is_active = true);