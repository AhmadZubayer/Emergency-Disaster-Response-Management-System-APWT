ALTER TABLE users
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS password,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS refresh_token,
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS email_verification_token,
  DROP COLUMN IF EXISTS email_verification_expires;

INSERT INTO donation_campaigns (
    id, title, description, target_amount, raised_amount, status, start_date, end_date, created_at, updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Sylhet Emergency Flood Relief 2026',
    'Providing immediate dry food, drinking water, and medical aid to flood victims in Sylhet.',
    1000000.00,
    0.00,
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
);