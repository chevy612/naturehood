import { tokens } from "@/app/components/ui/tokens";

export const metadata = {
  title: "Privacy Policy — Naturehood",
  description: "How Naturehood collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-[#141115] min-h-screen">
      <div
        className="max-w-3xl mx-auto px-6 py-16"
        style={{ fontFamily: tokens.font.body }}
      >
        {/* Header */}
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: tokens.font.heading }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-[#6B6870] mb-12">Last updated: February 2026</p>

        <Section title="1. Introduction">
          <p>
            NatureHood ("we", "us", or "our") operates a platform that connects athletes and brands
            for authentic partnerships. This Privacy Policy explains how we collect, use, store, and
            protect your personal data in accordance with the{" "}
            <strong className="text-white">
              Personal Data (Privacy) Ordinance (Cap. 486)
            </strong>{" "}
            of Hong Kong ("PDPO") and applicable international data protection standards.
          </p>
          <p className="mt-3">
            By using NatureHood, you acknowledge that you have read and understood this policy.
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <p className="mb-4">We collect personal data through the following channels:</p>

          <SubSection title="Quick Sign-Up">
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Role (athlete or brand)</li>
              <li>Marketing preferences (opt-in)</li>
            </ul>
          </SubSection>

          <SubSection title="Account Registration">
            <ul>
              <li>Email address</li>
              <li>Username</li>
              <li>Password (stored in hashed form — we never see your plain-text password)</li>
              <li>Account type (individual athlete or business)</li>
            </ul>
          </SubSection>

          <SubSection title="Athlete Applications">
            <ul>
              <li>Full name, email, phone number</li>
              <li>Sport or discipline, years of experience</li>
              <li>Instagram handle and follower count</li>
              <li>Location, portfolio URL</li>
              <li>Project ideas and availability</li>
            </ul>
          </SubSection>

          <SubSection title="Brand Partnership Applications">
            <ul>
              <li>Company name, contact name, job title</li>
              <li>Business email, phone, website</li>
              <li>Industry, company size, budget range, timeline</li>
              <li>Partnership objectives and target audience</li>
            </ul>
          </SubSection>

          <SubSection title="Email Subscriptions">
            <ul>
              <li>Email address (for newsletter and platform updates)</li>
            </ul>
          </SubSection>

          <SubSection title="Technical Data">
            <ul>
              <li>Authentication session tokens (stored as cookies — see our{" "}
                <a href="/cookies" className="text-[#C8F04D] hover:underline">Cookie Policy</a>)
              </li>
            </ul>
          </SubSection>
        </Section>

        <Section title="3. Why We Collect It (Purpose — DPP 1)">
          <p className="mb-3">We collect personal data only for the following lawful purposes:</p>
          <ul>
            <li>To create and manage your account on NatureHood</li>
            <li>To match athletes with relevant brand partnership opportunities</li>
            <li>To communicate with you about the platform, your applications, and matched partnerships</li>
            <li>To send marketing updates and newsletters (only where you have opted in)</li>
            <li>To improve and maintain the security and performance of the platform</li>
            <li>To comply with our legal obligations under Hong Kong law</li>
          </ul>
          <p className="mt-3">
            We will not use your personal data for any purpose other than those listed above without
            your consent or a lawful basis under the PDPO.
          </p>
        </Section>

        <Section title="4. How We Store It (Security — DPP 4)">
          <p>
            Your data is stored on <strong className="text-white">Supabase</strong>, a cloud database
            platform hosted on Amazon Web Services (AWS) infrastructure. All data is encrypted in
            transit (TLS/HTTPS) and at rest. Passwords are hashed using industry-standard algorithms
            and are never stored in plain text.
          </p>
          <p className="mt-3">
            We take reasonable steps to protect your personal data against unauthorised access,
            disclosure, alteration, or destruction. Access to production data is restricted to
            authorised personnel only.
          </p>
        </Section>

        <Section title="5. Who We Share It With (Disclosure — DPP 3)">
          <p className="mb-3">
            <strong className="text-white">We do not sell your personal data.</strong> We may share it
            only in the following circumstances:
          </p>
          <ul>
            <li>
              <strong className="text-white">Supabase</strong> — as our data processor for storage and
              authentication. Supabase processes data on our behalf under a data processing agreement.
            </li>
            <li>
              <strong className="text-white">Brand or athlete partners</strong> — where you have
              submitted an application or expressed interest in a partnership, relevant profile
              information may be shared with the matched party.
            </li>
            <li>
              <strong className="text-white">Legal requirements</strong> — if required by law,
              regulation, or court order in Hong Kong or another applicable jurisdiction.
            </li>
          </ul>
        </Section>

        <Section title="6. Your Rights (DPP 6)">
          <p className="mb-3">
            Under the PDPO (sections 18 and 22), you have the right to:
          </p>
          <ul>
            <li>
              <strong className="text-white">Access</strong> — request a copy of the personal data we
              hold about you
            </li>
            <li>
              <strong className="text-white">Correction</strong> — request that inaccurate personal
              data be corrected
            </li>
            <li>
              <strong className="text-white">Deletion</strong> — request that your account and personal
              data be deleted (we will action this within 90 days)
            </li>
            <li>
              <strong className="text-white">Opt-out of marketing</strong> — unsubscribe from
              marketing emails at any time via the unsubscribe link or by contacting us
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@naturehood.com" className="text-[#C8F04D] hover:underline">
              privacy@naturehood.co
            </a>
            . We will respond within 40 days as required by the PDPO.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <ul>
            <li>Account data is retained for as long as your account is active.</li>
            <li>
              If you request account deletion, your personal data will be removed from our systems
              within 90 days.
            </li>
            <li>
              Email subscription data is retained until you unsubscribe or request deletion.
            </li>
            <li>
              Application data (athlete and brand forms) is retained for up to 2 years to support
              partnership matching, unless you request earlier deletion.
            </li>
          </ul>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use essential cookies to maintain your authenticated session. We do not use
            advertising or analytics tracking cookies. For full details, see our{" "}
            <a href="/cookies" className="text-[#C8F04D] hover:underline">
              Cookie Policy
            </a>
            .
          </p>
        </Section>

        <Section title="9. International Transfers">
          <p>
            NatureHood is based in Hong Kong and welcomes brand partners globally. When personal data
            is transferred outside of Hong Kong (for example, to AWS infrastructure), we ensure
            appropriate safeguards are in place consistent with PDPO requirements and international
            data protection standards.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the "Last
            updated" date at the top of this page and, where material changes are made, notify you by
            email or via a notice on the platform.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p className="mb-2">
            For privacy inquiries, data access requests, or complaints:
          </p>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:privacy@naturehood.co" className="text-[#C8F04D] hover:underline">
                privacy@naturehood.com
              </a>
            </li>
          </ul>
          <p className="mt-3">
            You also have the right to lodge a complaint with the{" "}
            <a
              href="https://www.pcpd.org.hk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C8F04D] hover:underline"
            >
              Office of the Privacy Commissioner for Personal Data (PCPD)
            </a>{" "}
            in Hong Kong.
          </p>
        </Section>
      </div>
    </main>
  );
}

// ─── Shared layout helpers ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-lg font-semibold text-white mb-3 pb-2 border-b border-[#3A373C]"
        style={{ fontFamily: tokens.font.heading }}
      >
        {title}
      </h2>
      <div className="text-sm text-[#6B6870] leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-white/80 mb-1">{title}</h3>
      <ul className="list-disc list-inside space-y-1 pl-2">{children}</ul>
    </div>
  );
}
