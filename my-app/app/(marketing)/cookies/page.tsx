import { tokens } from "@/app/components/ui/tokens";

export const metadata = {
  title: "Cookie Policy — Naturehood",
  description: "Information about the cookies used on the Naturehood platform.",
};

export default function CookiesPage() {
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
          Cookie Policy
        </h1>
        <p className="text-sm text-[#6B6870] mb-12">Last updated: February 2026</p>

        <Section title="1. What Are Cookies?">
          <p>
            Cookies are small text files placed on your device by a website when you visit it. They
            are widely used to make websites work efficiently and to provide information to website
            operators. Cookies can be "session" cookies (deleted when you close your browser) or
            "persistent" cookies (stored for a set period of time).
          </p>
          <p className="mt-3">
            Naturehood also uses <strong className="text-white">localStorage</strong> — a similar
            browser storage mechanism — to remember your cookie consent preference.
          </p>
        </Section>

        <Section title="2. Cookies We Use">
          <p className="mb-4">
            Naturehood uses only <strong className="text-white">essential cookies</strong>. We do
            not use advertising, analytics, or third-party tracking cookies of any kind.
          </p>

          {/* Cookie table */}
          <div className="overflow-x-auto rounded-md border border-[#3A373C]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#3A373C] bg-white/5">
                  <th className="text-left px-4 py-3 text-white font-semibold">Name</th>
                  <th className="text-left px-4 py-3 text-white font-semibold">Type</th>
                  <th className="text-left px-4 py-3 text-white font-semibold">Purpose</th>
                  <th className="text-left px-4 py-3 text-white font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A373C]">
                <tr>
                  <td className="px-4 py-3 text-white/80 font-mono text-xs">sb-*-auth-token</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#C8F04D]/10 text-[#C8F04D]">
                      Essential
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B6870]">
                    Maintains your authenticated session so you stay logged in
                  </td>
                  <td className="px-4 py-3 text-[#6B6870]">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white/80 font-mono text-xs">
                    sb-*-auth-token-code-verifier
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#C8F04D]/10 text-[#C8F04D]">
                      Essential
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B6870]">
                    Used during login to verify the authentication request (PKCE security flow)
                  </td>
                  <td className="px-4 py-3 text-[#6B6870]">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white/80 font-mono text-xs">
                    nh-cookie-consent
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                      Functional
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B6870]">
                    Stored in localStorage — remembers that you have acknowledged this cookie notice
                    so the banner does not reappear
                  </td>
                  <td className="px-4 py-3 text-[#6B6870]">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="3. No Tracking or Advertising Cookies">
          <p>
            We do not use Google Analytics, Facebook Pixel, advertising networks, or any other
            third-party tracking technology. The only cookies placed on your device are those listed
            in the table above, which are strictly necessary to operate the authentication features
            of the Platform.
          </p>
        </Section>

        <Section title="4. Managing Cookies">
          <p className="mb-3">
            You can control and delete cookies through your browser settings. Note that disabling
            essential cookies will prevent you from staying logged in to Naturehood.
          </p>
          <p className="mb-3">Instructions for common browsers:</p>
          <ul>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8F04D] hover:underline"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8F04D] hover:underline"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8F04D] hover:underline"
              >
                Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8F04D] hover:underline"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
        </Section>

        <Section title="5. Changes to This Policy">
          <p>
            We may update this Cookie Policy if we change the cookies we use. When we do, we will
            revise the "Last updated" date at the top of this page.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            For questions about our use of cookies, contact us at{" "}
            <a href="mailto:privacy@naturehood.co" className="text-[#C8F04D] hover:underline">
              privacy@naturehood.com
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}

// ─── Shared layout helper ────────────────────────────────────────────────────

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
