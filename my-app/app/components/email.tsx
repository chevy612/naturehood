"use client";

import { useState } from "react";

export default function EmailSubscribe() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async () => {
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Example API call (replace with your own endpoint)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage("Email submitted successfully!");
      setEmail("");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0 flex flex-col gap-3 mb-6">
      <p className="text-sm sm:text-base">Subscribe to our newsletter:</p>
      <div className="flex flex-row items-center gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-primary w-2/3 sm:flex-1 sm:w-auto min-w-0"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary inline-flex items-center justify-center py-2.5 px-5 shrink-0 text-sm" 
        >
          {loading ? "Submitting..." : "Confirm"}
        </button>
      </div>
      {message && <p className="text-xs sm:text-sm text-gray-600">{message}</p>}
    </div>
  );
}
