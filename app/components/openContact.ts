// Any "Send your settings" button calls this to open the contact form
// (ContactWidget listens for the event). Optionally pre-select a request type:
//   'tip'  = Community tip
//   'pro'  = Pro player verification
//   'new'  = Missing player addition
export const OPEN_CONTACT_EVENT = "r6:open-contact";

export type ContactRequestType = "tip" | "pro" | "new";

export function openContact(requestType?: ContactRequestType) {
  window.dispatchEvent(
    new CustomEvent(OPEN_CONTACT_EVENT, { detail: { requestType } })
  );
}
