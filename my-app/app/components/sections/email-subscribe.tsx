"use client";

import { CTAEmailCapture } from "@/app/components/layout/email";
import { subscribeToCommunity } from "./subscribe-actions";

export default function EmailSubscribe() {
  const handleEmailSubmit = async (email: string) => {
    const result = await subscribeToCommunity(email);
    if (!result.ok) throw new Error(result.error);
    return result.message;
  };

  return (
    <section id="subscribe" style={{ scrollMarginTop: "96px" }}>
      <CTAEmailCapture
        headline="Join the Naturehood community"
        subtext="Get exclusive updates on athlete collaborations, brand partnerships, and product news"
        placeholder="Enter your email"
        onSubmit={handleEmailSubmit}
      />
    </section>
  );
}
