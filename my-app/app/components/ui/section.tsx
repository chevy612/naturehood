"use client";

import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`py-12 sm:py-16 md:py-20 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}