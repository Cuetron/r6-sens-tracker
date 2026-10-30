"use client";

import { openContact, type ContactRequestType } from "@/app/components/openContact";

// A button that opens the contact form (optionally pre-selecting a request type).
// Lets server components such as the footer and team pages stay server components.
export default function ContactButton({
  requestType,
  className,
  children,
}: {
  requestType?: ContactRequestType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={`text-left ${className ?? ""}`} onClick={() => openContact(requestType)}>
      {children}
    </button>
  );
}
