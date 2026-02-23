import { tokens } from "@/app/components/ui/tokens";

export const metadata = {
  title: "Terms of Service — Naturehood",
  description: "Terms and conditions for using the Naturehood platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-[#6B6870] mb-12">Last updated: February 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using the Naturehood platform (the "Platform"), you agree to be bound by
            these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use
            the Platform.
          </p>
          <p className="mt-3">
            These Terms constitute a legally binding agreement between you and Naturehood. We may
            update these Terms from time to time and will notify you of material changes by email or
            via a notice on the Platform.
          </p>
        </Section>

        <Section title="2. About Naturehood">
          <p>
            Naturehood is a partnership and production platform that connects Hong Kong–based athletes 
            with brands for sponsorships and collaborations. Naturehood participates as a party in 
            collaboration agreements and provides end-to-end services including creative strategy, 
            concept development, creative direction, talent coordination, content production, 
            and campaign delivery. Unless otherwise agreed in writing, Naturehood will manage the 
            collaboration process and deliverables together with the athlete(s) and brand.
          </p>
        </Section>

        <Section title="3. Eligibility">
          <ul>
            <li>
              <strong className="text-white">Athletes:</strong> You must be an individual primarily
              based in Hong Kong and engaged in an outdoor, adventure, or nature-related sport or
              activity.
            </li>
            <li>
              <strong className="text-white">Brands:</strong> You must represent a legitimate business
              entity. Brands from any country are welcome to register.
            </li>
            <li>
              <strong className="text-white">Age:</strong> You must be at least 18 years of age, or
              have the consent of a parent or legal guardian.
            </li>
            <li>
              <strong className="text-white">One account per user:</strong> Each person or business
              may maintain only one account on the Platform.
            </li>
          </ul>
        </Section>

        <Section title="4. Account Responsibilities">
          <p className="mb-3">When you create an account, you agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Keep your login credentials secure and not share them with others</li>
            <li>Notify us promptly of any unauthorised access to your account</li>
            <li>
              Take responsibility for all activity that occurs under your account
            </li>
          </ul>
          <p className="mt-3">
            Naturehood is not liable for any loss or damage arising from your failure to maintain
            the security of your account.
          </p>
        </Section>

        <Section title="5. User Content">
          <p>
            You retain ownership of any content you submit to Naturehood, including profile
            information, photos, project ideas, and application details ("User Content").
          </p>
          <p className="mt-3">
            By submitting User Content, you grant Naturehood a non-exclusive, royalty-free,
            worldwide licence to display, reproduce, and use that content solely for the purpose of
            operating and improving the Platform, including presenting your profile to potential
            brand or athlete partners.
          </p>
          <p className="mt-3">
            You represent and warrant that your User Content does not infringe any third-party
            intellectual property rights and complies with all applicable laws.
          </p>
        </Section>

        <Section title="6. Prohibited Conduct">
          <p className="mb-3">You must not use the Platform to:</p>
          <ul>
            <li>Impersonate any person, business, or entity</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Send unsolicited commercial messages (spam)</li>
            <li>Engage in any activity that is unlawful under Hong Kong or applicable international law</li>
            <li>Attempt to gain unauthorised access to any part of the Platform or its systems</li>
            <li>Scrape, copy, or redistribute Platform data without our written permission</li>
            <li>Harass, threaten, or harm other users</li>
          </ul>
          <p className="mt-3">
            Violation of these prohibitions may result in immediate account suspension or termination.
          </p>
        </Section>

        <Section title="7. Partnership Arrangements">
          <p>
            Naturehood facilitates introductions between athletes and brands. Any partnership,
            sponsorship, collaboration, or commercial arrangement agreed between an athlete and a
            brand is an independent agreement solely between those parties.
          </p>
          <p className="mt-3">
            Naturehood is not a party to such arrangements and accepts no responsibility or liability
            for their terms, performance, outcomes, or disputes. Participants are solely responsible
            for conducting appropriate due diligence before entering into any partnership.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            The Naturehood name, logo, platform design, and all proprietary content are owned by
            Naturehood and protected by applicable intellectual property laws. You may not use our
            trademarks, logos, or platform content without our prior written consent.
          </p>
          <p className="mt-3">
            Nothing in these Terms transfers ownership of our intellectual property to you.
          </p>
        </Section>

        <Section title="9. Privacy">
          <p>
            Your use of the Platform is also governed by our{" "}
            <a href="/privacy" className="text-[#C8F04D] hover:underline">
              Privacy Policy
            </a>
            , which is incorporated into these Terms by reference. By using the Platform, you consent
            to the collection and use of your personal data as described in the Privacy Policy.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            The Platform is provided on an "as is" and "as available" basis without warranties of any
            kind, express or implied. Naturehood does not warrant that the Platform will be
            uninterrupted, error-free, or free of harmful components.
          </p>
          <p className="mt-3">
            To the maximum extent permitted by Hong Kong law, Naturehood shall not be liable for any
            indirect, incidental, consequential, or punitive damages, including loss of data, loss of
            revenue, or loss of business opportunity, arising from your use of or inability to use the
            Platform.
          </p>
        </Section>

        <Section title="11. Termination">
          <p>
            Naturehood reserves the right to suspend or terminate your account at any time, with or
            without notice, if you breach these Terms or if we reasonably believe your account poses
            a risk to the Platform or other users.
          </p>
          <p className="mt-3">
            You may close your account at any time by contacting us at{" "}
            <a href="mailto:hello@naturehood.co" className="text-[#C8F04D] hover:underline">
              hello@naturehood.co
            </a>
            . Upon closure, your personal data will be handled in accordance with our Privacy Policy.
          </p>
        </Section>

        <Section title="12. Governing Law and Dispute Resolution">
          <p>
            These Terms are governed by and construed in accordance with the laws of the Hong Kong
            Special Administrative Region. Any disputes arising from or in connection with these
            Terms shall be subject to the exclusive jurisdiction of the courts of Hong Kong SAR.
          </p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>
            We may revise these Terms at any time. When we do, we will update the "Last updated"
            date. For material changes, we will provide at least 14 days' notice by email or via an
            in-platform notification. Your continued use of the Platform after changes take effect
            constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            For questions about these Terms, contact us at:{" "}
            <a href="mailto:hello@naturehood.co" className="text-[#C8F04D] hover:underline">
              hello@naturehood.co
            </a>
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
