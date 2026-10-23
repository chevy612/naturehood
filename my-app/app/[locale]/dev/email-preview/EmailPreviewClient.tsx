"use client";

import { useState } from "react";

type EmailPreview = { id: string; label: string; html: string };

const WIDTHS = { desktop: 600, mobile: 390 } as const;
type WidthKey = keyof typeof WIDTHS;

export function EmailPreviewClient({ emails }: { emails: EmailPreview[] }) {
  const [width, setWidth] = useState<WidthKey>("desktop");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#2b2b2b",
        padding: "24px 16px 64px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#ddd",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>
            Naturehood email preview
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9a9a9a" }}>
            Dev only. Edits to email-template.tsx hot-reload here.
          </p>
        </div>
        <div style={{ display: "inline-flex", gap: 8 }}>
          {(Object.keys(WIDTHS) as WidthKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setWidth(key)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                borderRadius: 999,
                border: `1px solid ${width === key ? "#fff" : "#555"}`,
                background: width === key ? "#fff" : "transparent",
                color: width === key ? "#111" : "#ccc",
                cursor: "pointer",
              }}
            >
              {key} · {WIDTHS[key]}px
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {emails.map((email) => (
          <div key={email.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8a8a8a",
                textAlign: "center",
              }}
            >
              {email.label}
            </span>
            <iframe
              title={email.label}
              srcDoc={email.html}
              style={{
                width: WIDTHS[width],
                maxWidth: "100%",
                height: 720,
                border: "1px solid #444",
                background: "#000",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
