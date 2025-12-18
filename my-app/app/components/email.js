"use client";

import { useState } from "react";

export default function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    <div className="flex flex-col gap-2 max-w-sm">
        <p>Subscribe to our newsletter:</p>
      <div className="flex flex-row gap-2 ">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white-500"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="h-10 w-25 px-1 bg-green-500 text-black py-2 hover:bg-green-300 hover:text-green-950 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Confirm"}
        </button>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
