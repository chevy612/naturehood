import { notFound } from "next/navigation";

import {
  communityWelcomeEmailHtml,
  newSubscriberNotificationEmailHtml,
  otpEmailHtml,
  passwordResetEmailHtml,
  welcomeEmailHtml,
} from "@/app/components/email-template";

import { EmailPreviewClient } from "./EmailPreviewClient";

export const metadata = { title: "Email preview (dev)" };

// Dev-only harness for iterating on the Resend email templates. The templates are
// generated server-side (exactly as they are for sending) and previewed in isolated
// iframes. Not linked anywhere and 404s in production.
export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const emails = [
    { id: "community", label: "Community welcome", html: communityWelcomeEmailHtml() },
    {
      id: "team",
      label: "New subscriber (team)",
      html: newSubscriberNotificationEmailHtml("runner@example.com"),
    },
    { id: "welcome", label: "Welcome", html: welcomeEmailHtml("Alex") },
    { id: "otp", label: "OTP verification", html: otpEmailHtml("184302") },
    {
      id: "reset",
      label: "Password reset",
      html: passwordResetEmailHtml(
        "https://naturehoodofficial.com/auth/reset-password?token=demo"
      ),
    },
  ];

  return <EmailPreviewClient emails={emails} />;
}
