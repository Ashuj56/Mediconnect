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

-- Add doctor availability for John Doe (Cardiology)
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
VALUES 
  ((SELECT user_id FROM profiles WHERE first_name = 'John' AND last_name = 'Doe' AND role = 'doctor'), 1, '09:00', '17:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'John' AND last_name = 'Doe' AND role = 'doctor'), 2, '09:00', '17:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'John' AND last_name = 'Doe' AND role = 'doctor'), 3, '09:00', '17:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'John' AND last_name = 'Doe' AND role = 'doctor'), 4, '09:00', '17:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'John' AND last_name = 'Doe' AND role = 'doctor'), 5, '09:00', '17:00', true);

-- Add doctor availability for pro gamerz (Family Medicine)  
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available)
VALUES 
  ((SELECT user_id FROM profiles WHERE first_name = 'pro' AND last_name = 'gamerz' AND role = 'doctor'), 1, '10:00', '18:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'pro' AND last_name = 'gamerz' AND role = 'doctor'), 2, '10:00', '18:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'pro' AND last_name = 'gamerz' AND role = 'doctor'), 3, '10:00', '18:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'pro' AND last_name = 'gamerz' AND role = 'doctor'), 4, '10:00', '18:00', true),
  ((SELECT user_id FROM profiles WHERE first_name = 'pro' AND last_name = 'gamerz' AND role = 'doctor'), 5, '10:00', '18:00', true);