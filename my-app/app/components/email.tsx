"use client";

import { EmailBanner } from "./basic/basic";

export default function EmailSubscribe() {
  const handleEmailSubmit = async (email: string) => {
    // Example API call (replace with your own endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // You can add actual API logic here, e.g.:
    // await fetch('/api/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify({ email }),
    // });

    console.log("Email submitted:", email);
  };

  return (
    <EmailBanner
      title="Join the Naturehood community"
      subtitle="Get exclusive updates on athlete collaborations, brand partnerships, and platform news"
      placeholder="Enter your email"
      buttonText="Subscribe"
      onSubmit={handleEmailSubmit}
      variant="dark"
    />
  );
}
