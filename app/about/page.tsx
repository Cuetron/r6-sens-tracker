import type { Metadata } from 'next';
import Icon from '@/app/components/Icons';
import { X_HANDLES } from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'About: built by the community',
  description:
    'R6Sens is a non-profit database of Rainbow Six Siege pro settings and gear, collected from the players. Where the numbers come from, who to talk to, and fair use.',
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-10 md:py-14">
      <div className="md:grid md:grid-cols-[minmax(0,480px)_minmax(0,1fr)] md:gap-8">
        <h2 id={id} className="display max-w-[480px] text-[40px] md:text-[56px]">
          {title}
        </h2>
        <div className="mt-5 max-w-[680px] md:mt-0">{children}</div>
      </div>
    </section>
  );
}

export default function AboutContact() {
  return (
    <main id="main">
      {/* Header */}
      <header className="page pt-12 md:pt-20 desk:pt-28">
        <div className="desk:grid desk:grid-cols-[1fr_320px] desk:items-end desk:gap-12">
          <h1 className="display text-[60px] md:text-[104px] desk:text-[136px]">
            Built by the
            <br />
            <span className="text-accent">Community.</span>
          </h1>
          <p className="mt-6 text-base leading-normal text-muted md:text-lg md:leading-[1.5] desk:mt-0 desk:pb-3">
            Non-profit, never monetised. Just the settings, kept current.
          </p>
        </div>
      </header>

      <div className="page mt-12 md:mt-20">
        <Section id="why-heading" title="Why it exists">
          <p className="text-[17px] leading-relaxed md:text-lg">
            Settings change with the meta. Tracking DPI, multipliers and aspect ratios across
            almost two hundred pros by hand is slow and easy to get wrong.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed md:text-lg">
            R6Sens keeps one place for all of it, so you can copy a pro setup or compare a whole
            roster in seconds.
          </p>
        </Section>

        <Section id="numbers-heading" title="Where the numbers come from">
          <ul className="flex flex-col gap-6">
            <li className="flex gap-3">
              <Icon name="badge-check" size={20} className="mt-0.5 shrink-0 text-signal" />
              <div>
                <p className="font-semibold">Sent by the player</p>
                <p className="mt-1 text-[14px] leading-normal text-muted">
                  The pro sent or confirmed these settings to us directly. This is the mark to look
                  for.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Icon name="circle-dashed" size={20} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <p className="font-semibold">Collected</p>
                <p className="mt-1 text-[14px] leading-normal text-muted">
                  Taken from public sources such as streams and team posts, and checked when a
                  player confirms.
                </p>
              </div>
            </li>
          </ul>
          <p className="mt-6 text-[14px] leading-normal text-muted">
            Team and organisation data is sourced with thanks from the contributors at{' '}
            <a
              href="https://liquipedia.net/rainbowsix/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              Liquipedia
            </a>
            .
          </p>
        </Section>

        <Section id="talk-heading" title="Talk to us">
          <p className="text-[15px] leading-normal text-muted">
            Send your settings, report a change or ask a question. DM any of us on X.
          </p>
          <ul className="mt-6 border-t border-line">
            {X_HANDLES.map((x) => (
              <li key={x.handle} className="border-b border-line">
                <a
                  href={x.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-4 transition-colors duration-[120ms] hover:text-accent"
                >
                  <span className="font-display text-[36px] font-bold leading-none md:text-[44px]">
                    {x.handle}
                  </span>
                  <Icon name="arrow-up-right" size={20} />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="thanks-heading" title="Thanks">
          <p className="text-[17px] leading-relaxed md:text-lg">
            To the Rainbow Six Siege pros and creators who reach out to share and update their
            settings. Your openness closes the gap between the top of the game and everyone else.
          </p>
          <p className="mt-4 text-[15px] leading-normal text-muted">
            And to the R6 community, who made this tracker possible.
          </p>
        </Section>

        <Section id="fairuse-heading" title="Fair use and data">
          <p className="text-[15px] leading-relaxed text-muted">
            Team logos, league branding and esports imagery are used under fair use, for
            information and identification only, as web-resolution copies. All copyrights and
            trademarks belong to their owners, including Ubisoft, tournament organisers and the
            teams.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            R6Sens is non-profit and will stay that way. Scraping, mass copying or republishing the
            curated settings data on other sites or services is not allowed.
          </p>
        </Section>
      </div>
    </main>
  );
}
