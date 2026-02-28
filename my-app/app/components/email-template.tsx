// ─────────────────────────────────────────────
// NATUREHOOD — Email Templates
// Used with Resend. All styles are inline for
// email-client compatibility (no CSS classes).
//
// Design tokens applied:
//   ink:      #141115  (background)
//   surface1: #1E1B1F  (card)
//   border:   #3A373C
//   accent:   #C8F04D  (lime)
//   white:    #FFFFFF
//   text2:    #A09EA3
//   muted:    #6B6870
//   fonts:    Inter (headings) · DM Sans (body)
// ─────────────────────────────────────────────

const GOOGLE_FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet" />
`

// ─── Shared shell ────────────────────────────

function emailShell(title: string, cardContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <title>${title}</title>
  ${GOOGLE_FONTS}
</head>
<body style="margin:0;padding:0;background-color:#141115;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="background-color:#141115;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <table width="560" cellpadding="0" cellspacing="0" border="0" role="presentation"
          style="max-width:560px;width:100%;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="padding:0 0 28px 0;">
              <span style="
                font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                font-size:18px;
                font-weight:700;
                color:#FFFFFF;
                letter-spacing:0.15em;
                text-transform:uppercase;
              ">NATUREHOOD</span>
            </td>
          </tr>

          <!-- ── CARD ── -->
          <tr>
            <td style="
              background-color:#1E1B1F;
              border:1px solid #3A373C;
              padding:48px;
            ">
              ${cardContent}
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="padding:28px 0 0;">
              <p style="
                margin:0 0 6px;
                font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                font-size:13px;
                color:#6B6870;
                line-height:1.6;
              ">Connecting athletes and brands through authentic partnerships.</p>
              <p style="
                margin:0;
                font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                font-size:12px;
                color:#3A373C;
                line-height:1.6;
              ">© ${new Date().getFullYear()} Naturehood Official · Made in Hong Kong</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Shared label + heading + body text ──────

function cardHeader(label: string, heading: string, body: string): string {
  return `
    <p style="
      margin:0 0 20px;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:10px;
      font-weight:600;
      color:#C8F04D;
      letter-spacing:0.3em;
      text-transform:uppercase;
      line-height:1.4;
    ">${label}</p>

    <h2 style="
      margin:0 0 12px;
      font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:28px;
      font-weight:700;
      color:#FFFFFF;
      letter-spacing:-0.015em;
      line-height:1.2;
    ">${heading}</h2>

    <p style="
      margin:0 0 36px;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:16px;
      color:#A09EA3;
      line-height:1.75;
    ">${body}</p>
  `
}

// ─────────────────────────────────────────────
// 1. OTP VERIFICATION EMAIL
// ─────────────────────────────────────────────

export function otpEmailHtml(code: string): string {
  const card = `
    ${cardHeader(
      'Email Verification',
      'Verify your email',
      'Enter this code to continue creating your Naturehood account:'
    )}

    <!-- OTP code box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
      <tr>
        <td style="
          background-color:#141115;
          border:1px solid #3A373C;
          padding:28px 24px;
          text-align:center;
        ">
          <span style="
            font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:48px;
            font-weight:700;
            color:#C8F04D;
            letter-spacing:0.3em;
            line-height:1;
          ">${code}</span>
        </td>
      </tr>
    </table>

    <!-- Expiry note -->
    <p style="
      margin:24px 0 0;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:13px;
      color:#6B6870;
      line-height:1.6;
    ">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
  `

  return emailShell('Your Naturehood verification code', card)
}

// ─────────────────────────────────────────────
// 2. WELCOME EMAIL
// ─────────────────────────────────────────────

export function welcomeEmailHtml(firstName: string): string {
  const card = `
    ${cardHeader(
      'Welcome to Naturehood',
      `You're in, ${firstName}.`,
      'We connect dedicated athletes with forward-thinking brands to build creative projects that actually matter.'
    )}

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
      <tr>
        <td style="border-top:1px solid #3A373C;padding:0 0 28px;"></td>
      </tr>
    </table>

    <!-- What's next -->
    <p style="
      margin:0 0 8px;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:10px;
      font-weight:600;
      color:#C8F04D;
      letter-spacing:0.3em;
      text-transform:uppercase;
    ">What's next</p>
    <p style="
      margin:0 0 28px;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:15px;
      color:#A09EA3;
      line-height:1.75;
    ">Complete your profile, explore athlete and brand opportunities, and start building your legacy with Naturehood.</p>

    <!-- Tagline -->
    <p style="
      margin:0;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:13px;
      color:#6B6870;
      line-height:1.6;
    ">Build your legacy with Naturehood.</p>
  `

  return emailShell('Welcome to Naturehood', card)
}

// ─────────────────────────────────────────────
// 3. PASSWORD RESET EMAIL
// ─────────────────────────────────────────────

export function passwordResetEmailHtml(resetUrl: string): string {
  const card = `
    ${cardHeader(
      'Password Reset',
      'Reset your password',
      "We received a request to reset the password for your Naturehood account. Click the button below to create a new one."
    )}

    <!-- CTA button -->
    <table cellpadding="0" cellspacing="0" border="0" role="presentation">
      <tr>
        <td style="background-color:#C8F04D;">
          <a href="${resetUrl}" target="_blank" style="
            display:inline-block;
            padding:14px 32px;
            font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:15px;
            font-weight:600;
            color:#141115;
            text-decoration:none;
            letter-spacing:-0.01em;
          ">Reset Password</a>
        </td>
      </tr>
    </table>

    <!-- Fallback URL -->
    <p style="
      margin:20px 0 0;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:12px;
      color:#6B6870;
      line-height:1.6;
    ">If the button doesn't work, copy and paste this link into your browser:<br/>
    <a href="${resetUrl}" style="color:#C8F04D;text-decoration:underline;word-break:break-all;">${resetUrl}</a></p>

    <!-- Expiry note -->
    <p style="
      margin:20px 0 0;
      font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:13px;
      color:#6B6870;
      line-height:1.6;
    ">This link expires in 60 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
  `

  return emailShell('Reset your Naturehood password', card)
}
