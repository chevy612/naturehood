import Link from "next/link";
import Image from "next/image";
import { Container} from '@/app/components/ui/container';
import { tokens } from '@/app/components/ui/tokens';
import { Instagram, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";

// ─────────────────────────────────────────────
// FOOTER LINKS
// ─────────────────────────────────────────────
const footerLinks = {
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/naturehood.official", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@naturehood.official", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com/company/naturehood-official", label: "LinkedIn" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#141115] border-t border-[#3A373C]/50 pt-16 pb-8">
      <Container>
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">

          {/* Brand Column - spans 2 on mobile */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/naturehood.svg"
                alt="Naturehood"
                width={160}
                height={64}
                className="w-40 h-auto"
              />
            </Link>
            <p
              className="text-sm text-[#6B6870] mb-6 max-w-sm leading-relaxed"
              style={{ fontFamily: tokens.font.body }}
            >
              Connecting athletes and brands through authentic partnerships.
              Build your legacy with Naturehood.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 hover:bg-[#C8F04D]/10 hover:text-[#C8F04D] text-white/70 transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          {/*}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest text-white mb-4"
              style={{ fontFamily: tokens.font.heading }}
            >
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6870] hover:text-[#C8F04D] transition-colors"
                    style={{ fontFamily: tokens.font.body }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          {/*
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest text-white mb-4"
              style={{ fontFamily: tokens.font.heading }}
            >
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6870] hover:text-[#C8F04D] transition-colors"
                    style={{ fontFamily: tokens.font.body }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          {/*
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest text-white mb-4"
              style={{ fontFamily: tokens.font.heading }}
            >
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6870] hover:text-[#C8F04D] transition-colors"
                    style={{ fontFamily: tokens.font.body }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> 
    

          {/* Legal Links */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest text-white mb-4"
              style={{ fontFamily: tokens.font.heading }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6870] hover:text-[#C8F04D] transition-colors"
                    style={{ fontFamily: tokens.font.body }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#3A373C]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              className="text-xs text-[#6B6870] text-center md:text-left"
              style={{ fontFamily: tokens.font.body }}
            >
              © {currentYear} Naturehood. All rights reserved.
            </p>
            <p
              className="text-xs text-[#6B6870] text-center md:text-right"
              style={{ fontFamily: tokens.font.body }}
            >
              Made in Hong Kong
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
