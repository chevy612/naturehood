-- Password reset tokens table
-- All access is via service-role admin client only (no RLS policies needed)

CREATE TABLE password_reset_tokens (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  token      text        NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prt_token ON password_reset_tokens(token);
CREATE INDEX idx_prt_email ON password_reset_tokens(email);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
