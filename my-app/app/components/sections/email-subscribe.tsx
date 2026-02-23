"use client";

import { CTAEmailCapture } from "@/app/components/layout/email";
import { createClient } from "@/lib/supabase/client";

export default function EmailSubscribe() {
  const handleEmailSubmit = async (email: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("subscribed_email")
      .insert({ email });

    if (error) {
      console.error("Subscription error:", error.message);
      throw new Error(error.message);
    }
  };

  return (
    <CTAEmailCapture
      headline="Join the Naturehood community"
      subtext="Get exclusive updates on athlete collaborations, brand partnerships, and product news"
      placeholder="Enter your email"
      onSubmit={handleEmailSubmit}
    />
  );
}
