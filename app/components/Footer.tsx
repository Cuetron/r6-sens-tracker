import Image from "next/image";
import Link from "next/link";
import ContactButton from "@/app/components/ContactButton";

export const X_HANDLES = [
  { handle: "@Benett", href: "https://twitter.com/benett_plesha" },
  { handle: "@itsQuetron", href: "https://twitter.com/itsQuetron" },
  { handle: "@Eaglemees", href: "https://twitter.com/Eaglemees" },
  { handle: "@Mingoran", href: "https://x.com/mingoran_" },
];

const linkClass =
  "text-[15px] text-ink transition-colors duration-[120ms] hover:text-accent";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="page py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-x-8">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo-crop.png"
              alt="R6Sens"
              width={519}
              height={172}
              style={{ height: 40, width: "auto" }}
            />
            <p className="mt-5 max-w-[360px] text-[15px] leading-relaxed text-muted">
              Rainbow Six Siege pro settings and gear, collected from the players. Built by the
              community, never for profit.
            </p>
          </div>

          <nav aria-label="Browse">
            <h2 className="text-[13px] text-muted">Browse</h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/" className={linkClass}>
                  Database
                </Link>
              </li>
              <li>
                <Link href="/regions" className={linkClass}>
                  Regions
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  About
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Contact on X">
            <h2 className="text-[13px] text-muted">Contact on X</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {X_HANDLES.map((x) => (
                <li key={x.handle}>
                  <a href={x.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {x.handle}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="For players">
            <h2 className="text-[13px] text-muted">For players</h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <ContactButton requestType="pro" className={linkClass}>
                  Send your settings
                </ContactButton>
              </li>
              <li>
                <ContactButton requestType="pro" className={linkClass}>
                  Update your entry
                </ContactButton>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 text-[13px] text-muted md:mt-16 md:flex-row md:justify-between">
          <p>
            Team logos and league branding are used under fair use. All trademarks belong to
            Ubisoft and their owners.
          </p>
          <p>
            Org data with thanks to{" "}
            <a
              href="https://liquipedia.net/rainbowsix/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors duration-[120ms] hover:text-ink"
            >
              Liquipedia
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
