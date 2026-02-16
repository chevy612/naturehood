"use client";

import { EmailBanner } from "./basic/basic";
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
    <EmailBanner
      title="Join the Naturehood community"
      subtitle="Get exclusive updates on athlete collaborations, brand partnerships, and product news"
      placeholder="Enter your email"
      buttonText="Subscribe"
      onSubmit={handleEmailSubmit}
      variant="dark"
    />
  );
}
