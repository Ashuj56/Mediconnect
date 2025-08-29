-- Update existing doctor profiles with more comprehensive information
UPDATE public.profiles 
SET 
  specialization = CASE 
    WHEN first_name = 'John' THEN 'Cardiology'
    WHEN first_name = 'pro' THEN 'Family Medicine'
    ELSE specialization
  END,
  consultation_fee = CASE 
    WHEN first_name = 'John' THEN 800
    WHEN first_name = 'pro' THEN 500
    ELSE consultation_fee
  END,
  bio = CASE 
    WHEN first_name = 'John' THEN 'Experienced cardiologist specializing in preventive care and heart disease management. Board certified with expertise in echocardiography and stress testing.'
    WHEN first_name = 'pro' THEN 'Family medicine physician providing comprehensive primary care for patients of all ages. Special interest in preventive medicine and chronic disease management.'
    ELSE bio
  END,
  medical_license_number = CASE 
    WHEN first_name = 'John' THEN 'MD12345'
    WHEN first_name = 'pro' THEN 'MD54321'
    ELSE medical_license_number
  END,
  experience_years = CASE 
    WHEN first_name = 'John' THEN 12
    WHEN first_name = 'pro' THEN 8
    ELSE experience_years
  END,
  is_verified = true,
  is_active = true
WHERE role = 'doctor';

-- Add doctor availability for the existing doctors (Monday to Friday, 9 AM to 5 PM)
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  user_id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '09:00'::time as start_time,
  '17:00'::time as end_time,
  true as is_available
FROM public.profiles 
WHERE role = 'doctor'
ON CONFLICT (doctor_id, day_of_week, start_time, end_time) DO NOTHING;