-- Verify the admin account was created
SELECT 
  id,
  full_name,
  email,
  role,
  email_verified,
  status,
  created_at
FROM users 
WHERE email = 'admin@bbmi.com';
