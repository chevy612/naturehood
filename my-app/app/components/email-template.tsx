// ─────────────────────────────────────────────
// NATUREHOOD — Email Templates
// Used with Resend. All styles are inline for
// email-client compatibility (no CSS classes).
//
// Design tokens applied:
//   bg:       #000000  (email background)
//   surface1: #1E1B1F  (card)
//   border:   #3A373C
//   accent:   #F5F5F5  (eyebrow / highlights)
//   white:    #FFFFFF  (headings + body)
//   fonts:    Sk Modernist (display: wordmark, eyebrow, h2)
//             · DM Sans (body + everything else)
//
// Layout: NATUREHOOD wordmark masthead (top) · bordered card
//         · circular brand mark sign-off (bottom).
// ─────────────────────────────────────────────

// Base URL for absolute asset links (fonts + logo PNGs). Overridable via
// NEXT_PUBLIC_SITE_URL; set to http://localhost:3000 in .env.local for local preview.
const ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://naturehoodofficial.com'

const DISPLAY_FONT = "'Sk Modernist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
const BODY_FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"

// DM Sans via Google Fonts (Apple Mail, iOS, some web clients) + Sk Modernist via
// @font-face from the hosted .otf. Clients that strip <style>/@font-face (Gmail, Outlook)
// fall back to DM Sans through the font stacks above.
//
// The [data-ogsc]/[data-ogsb] rules fight Gmail's mobile-app "auto dark mode," which
// detects our black/near-black design and inverts it (light card, dark text, default
// blue links) on some Gmail app inboxes even though the email is already dark-themed.
// Those attributes are injected by Gmail onto elements it recolors, so we use them to
// force our own palette back on the .nh-card / .nh-box hooks.
const HEAD_FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @font-face {
      font-family: 'Sk Modernist';
      font-style: normal;
      font-weight: 400;
      src: url('${ASSET_BASE_URL}/fonts/sk-modernist/Sk-Modernist-Regular.otf') format('opentype');
    }
    @font-face {
      font-family: 'Sk Modernist';
      font-style: normal;
      font-weight: 700;
      src: url('${ASSET_BASE_URL}/fonts/sk-modernist/Sk-Modernist-Bold.otf') format('opentype');
    }
    [data-ogsc] { color:#FFFFFF !important; }
    [data-ogsc] .nh-card, [data-ogsb] .nh-card { background-color:#1E1B1F !important; }
    [data-ogsc] .nh-box, [data-ogsb] .nh-box { background-color:#000000 !important; border-color:#3A373C !important; }
  </style>
`

// ─── Shared shell ────────────────────────────

function emailShell(title: string, cardContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>${title}</title>
  ${HEAD_FONTS}
</head>
<body style="margin:0;padding:0;background-color:#000000;" bgcolor="#000000">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="background-color:#000000;" bgcolor="#000000">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <table width="560" cellpadding="0" cellspacing="0" border="0" role="presentation"
          style="max-width:560px;width:100%;">

          <!-- ── MASTHEAD (wordmark) ── -->
          <tr>
            <td align="center" style="padding:0 0 28px 0;text-align:center;">
              <img src="${ASSET_BASE_URL}/email/wordmark.png" alt="NATUREHOOD" width="150"
                style="display:inline-block;width:150px;height:auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>

          <!-- ── CARD ── -->
          <tr>
            <td class="nh-card" bgcolor="#1E1B1F" style="
              background-color:#1E1B1F;
              border-radius:30px;
              padding:48px;
            ">
              ${cardContent}
            </td>
          </tr>

          <!-- ── FOOTER (brand mark sign-off) ── -->
          <tr>
            <td align="center" style="padding:28px 0 0;text-align:center;">
              <img src="${ASSET_BASE_URL}/email/mark.png" alt="Naturehood" width="60"
                style="display:inline-block;width:60px;height:auto;border:0;outline:none;text-decoration:none;margin:0 0 18px;" />
              <p style="
                margin:0 0 6px;
                font-family:${BODY_FONT};
                font-size:13px;
                color:rgba(255,255,255,0.5);
                line-height:1.6;
              ">Connecting athletes and brands through authentic partnerships.</p>
              <p style="
                margin:0;
                font-family:${BODY_FONT};
                font-size:12px;
                color:rgba(255,255,255,0.3);
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
      font-family:${DISPLAY_FONT};
      font-size:11px;
      font-weight:400;
      color:#F5F5F5;
      letter-spacing:0.04em;
      text-transform:uppercase;
      line-height:1.4;
    ">${label}</p>

    <h2 style="
      margin:0 0 12px;
      font-family:${DISPLAY_FONT};
      font-size:28px;
      font-weight:700;
      color:#FFFFFF;
      letter-spacing:-0.015em;
      line-height:1.05;
    ">${heading}</h2>

    <p style="
      margin:0 0 36px;
      font-family:${BODY_FONT};
      font-size:16px;
      color:#FFFFFF;
      line-height:1.75;
      letter-spacing:-0.2px;
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
        <td class="nh-box" bgcolor="#000000" style="
          background-color:#000000;
          border:1px solid #3A373C;
          border-radius:12px;
          padding:28px 24px;
          text-align:center;
        ">
          <span style="
            font-family:${BODY_FONT};
            font-size:48px;
            font-weight:700;
            color:#F5F5F5;
            letter-spacing:0.3em;
            line-height:1;
          ">${code}</span>
        </td>
      </tr>
    </table>

    <!-- Expiry note -->
    <p style="
      margin:24px 0 0;
      font-family:${BODY_FONT};
      font-size:13px;
      color:rgba(255,255,255,0.45);
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

    <!-- What's next -->
    <p style="
      margin:0 0 8px;
      font-family:${DISPLAY_FONT};
      font-size:11px;
      font-weight:400;
      color:#F5F5F5;
      letter-spacing:0.04em;
      text-transform:uppercase;
    ">What's next</p>
    <p style="
      margin:0 0 28px;
      font-family:${BODY_FONT};
      font-size:15px;
      color:#FFFFFF;
      line-height:1.75;
    ">Complete your profile, explore athlete and brand opportunities, and start building your legacy with Naturehood.</p>

    <!-- Tagline -->
    <p style="
      margin:0;
      font-family:${BODY_FONT};
      font-size:13px;
      color:rgba(255,255,255,0.45);
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

    <!-- CTA button — marketing primary (white, pill) -->
    <table cellpadding="0" cellspacing="0" border="0" role="presentation">
      <tr>
        <td style="background-color:#FFFFFF;border-radius:9999px;">
          <a href="${resetUrl}" target="_blank" style="
            display:inline-block;
            padding:14px 32px;
            font-family:${BODY_FONT};
            font-size:14px;
            font-weight:600;
            color:#141115;
            text-decoration:none;
            letter-spacing:-0.01em;
            border-radius:9999px;
          ">Reset Password</a>
        </td>
      </tr>
    </table>

    <!-- Fallback URL -->
    <p style="
      margin:20px 0 0;
      font-family:${BODY_FONT};
      font-size:12px;
      color:rgba(255,255,255,0.45);
      line-height:1.6;
    ">If the button doesn't work, copy and paste this link into your browser:<br/>
    <a href="${resetUrl}" style="text-decoration:underline;word-break:break-all;"><span style="color:#F5F5F5;">${resetUrl}</span></a></p>

    <!-- Expiry note -->
    <p style="
      margin:20px 0 0;
      font-family:${BODY_FONT};
      font-size:13px;
      color:rgba(255,255,255,0.45);
      line-height:1.6;
    ">This link expires in 60 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
  `

  return emailShell('Reset your Naturehood password', card)
}

// ─────────────────────────────────────────────
// 4. COMMUNITY WELCOME EMAIL (newsletter / "Join us")
// ─────────────────────────────────────────────

export function communityWelcomeEmailHtml(): string {
  const card = cardHeader(
    'Join the Community',
    'Welcome to Naturehood',
    "Welcome to Naturehood — the fast-growing startup founded in Hong Kong. We're currently looking for athletes, creators and builders to scale our business. Stay close, and reach out to " +
      '<a href="mailto:team@naturehoodofficial.com" style="text-decoration:underline;"><span style="color:#F5F5F5;">team@naturehoodofficial.com</span></a>' +
      ' anytime if you come up with a great idea!'
  )

  return emailShell('Welcome to Naturehood', card)
}

// ─────────────────────────────────────────────
// 5. NEW SUBSCRIBER — INTERNAL TEAM NOTIFICATION
// ─────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function newSubscriberNotificationEmailHtml(email: string): string {
  const card = `
    ${cardHeader(
      'New Community Member',
      'New signup',
      'Someone just joined the Naturehood community. Their email is below:'
    )}

    <!-- Subscriber email box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
      <tr>
        <td class="nh-box" bgcolor="#000000" style="
          background-color:#000000;
          border:1px solid #3A373C;
          border-radius:12px;
          padding:20px 24px;
          text-align:center;
        ">
          <span style="
            font-family:${BODY_FONT};
            font-size:20px;
            font-weight:700;
            color:#F5F5F5;
            line-height:1.35;
            word-break:break-all;
          ">${escapeHtml(email)}</span>
        </td>
      </tr>
    </table>

    <!-- Note -->
    <p style="
      margin:24px 0 0;
      font-family:${BODY_FONT};
      font-size:13px;
      color:rgba(255,255,255,0.45);
      line-height:1.6;
    ">Sent automatically when a new member joins via the website. Reply to this email to reach them directly.</p>
  `

  return emailShell('New Naturehood signup', card)
}
