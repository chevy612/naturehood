"use client";

import { useTranslations } from "next-intl";
import { CTAEmailCapture } from "@/app/components/layout/email";
import { subscribeToCommunity } from "./subscribe-actions";

export default function EmailSubscribe() {
  const t = useTranslations("Home");
  const tEmail = useTranslations("EmailCapture");

  const handleEmailSubmit = async (email: string) => {
    const result = await subscribeToCommunity(email);
    if (!result.ok) throw new Error(result.error || tEmail("error"));
    return result.message || tEmail("success");
  };

  return (
    <section id="subscribe" style={{ scrollMarginTop: "96px" }}>
      <CTAEmailCapture
        headline={t("subscribeHeadline")}
        subtext={t("subscribeSubtext")}
        placeholder={t("subscribePlaceholder")}
        onSubmit={handleEmailSubmit}
      />
    </section>
  );
}
