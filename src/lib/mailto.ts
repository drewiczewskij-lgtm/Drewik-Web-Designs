import { CONTACT } from '@/data/site';

/* ============================================================================
   SENDING WITHOUT A SERVER
   ----------------------------------------------------------------------------
   With no form service and no API connected, a request has nowhere to go. The
   honest options are to say so and give out the phone number, or to hand the
   message to the one piece of software every customer already has: their mail
   client.

   This does the second. The visitor fills the form, presses send, and their own
   mail app opens with the whole request typed out and addressed to the studio.
   They press send again and it is a normal email — which means the reply lands
   in their inbox and the conversation carries on there, with no account, no
   subscription and no third party in the middle.

   It is not silent, and that is the trade. The customer sees their mail app
   open, so the screen says that will happen before it does rather than letting
   it surprise them. Set `VITE_FORM_ENDPOINT` and the POST path takes over.
   ========================================================================= */

/** Mail clients vary; keep well under the shortest common URL ceiling. */
const MAX_URL = 1800;

export function mailtoUrl(subject: string, body: string, to: string = CONTACT.email): string {
  const encoded = (s: string) => encodeURIComponent(s);
  const base = `mailto:${to}?subject=${encoded(subject)}&body=`;
  let text = body;
  if (base.length + encoded(text).length > MAX_URL) {
    // Trim from the end rather than produce a URL the client silently drops.
    while (text.length > 0 && base.length + encoded(text).length > MAX_URL - 40) {
      text = text.slice(0, -80);
    }
    text += '\n\n(…continued by phone)';
  }
  return base + encoded(text);
}

/**
 * Opens the composed message.
 *
 * Through a real anchor rather than by assigning `location.href`: a page inside
 * an iframe — a preview, an embed — is often refused a top-level navigation,
 * and a `mailto:` assignment is exactly that. A clicked anchor carrying
 * `target="_blank"` is handed to the operating system instead, which is what
 * needs to happen anyway. Returns false only if the DOM refused outright.
 */
export function openMail(subject: string, body: string, to: string = CONTACT.email): boolean {
  try {
    const a = document.createElement('a');
    a.href = mailtoUrl(subject, body, to);
    a.target = '_blank';
    a.rel = 'noreferrer noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}

/** One "Label: value" line, skipped entirely when there is no value. */
export function line(label: string, value: string | undefined | null): string {
  const v = (value ?? '').trim();
  return v ? `${label}: ${v}\n` : '';
}
