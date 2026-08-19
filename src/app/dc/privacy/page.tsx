import DiscordLegalPage from '@/components/DiscordLegalPage';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
  title: 'Discord App Privacy Policy',
  description: 'Privacy policy for the AVRXT Discord bot application and Discord OAuth authentication.',
  keywords: ['AVRXT Discord bot privacy', 'Discord OAuth privacy policy', 'Discord application data'],
  path: '/dc/privacy',
});

export default function DiscordPrivacyPage() {
  return (
    <DiscordLegalPage
      label="// Discord Application / Privacy"
      title="Privacy Policy_"
      summary="This policy explains how the AVRXT Discord application and its authentication service collect, use, store, and protect Discord-related data. It applies when you authorize the application, use its bot features, or access protected AVRXT services with Discord."
      counterpartHref="/dc/terms"
      counterpartLabel="Discord App Terms"
      sections={[
        {
          title: 'Data We Collect',
          content: <>
            <p>Depending on the feature you use, we may receive <strong>your Discord user ID, username, display name, avatar, email address, OAuth authorization data, server membership, and assigned role IDs</strong>. When you interact with bot commands, we may also process the command, server ID, channel ID, interaction ID, and the response required to provide that command.</p>
            <p>We do not ask for or collect your Discord password. Discord credentials are entered only on Discord&apos;s authorization pages.</p>
          </>,
        },
        {
          title: 'How We Use Data',
          content: <ul>
            <li>Authenticate you and maintain a secure session.</li>
            <li>Confirm server membership or required roles before granting protected admin access.</li>
            <li>Operate requested bot commands and application features.</li>
            <li>Prevent abuse, investigate errors, and protect the application and its users.</li>
            <li>Comply with law, Discord&apos;s rules, and valid security requests.</li>
          </ul>,
        },
        {
          title: 'OAuth, Cookies & Storage',
          content: <>
            <p>Discord authentication is handled by our self-hosted <strong>OpenAuth</strong> service. It uses essential, HTTP-only cookies and short-lived authorization records to complete OAuth and maintain your session. Authentication records are stored in Cloudflare Workers KV. The public website runs on Vercel.</p>
            <p>We request only the Discord scopes needed for identity and authentication. Bot-based role verification is performed server-side and does not expose the bot token to your browser.</p>
          </>,
        },
        {
          title: 'Sharing & Third Parties',
          content: <>
            <p>We do not sell Discord API data, use it for targeted advertising, provide it to data brokers, or use message content to train AI models. Data is shared only with service providers necessary to operate the application, including <strong>Discord, Cloudflare, and Vercel</strong>, or when required by law.</p>
            <p>Those services process information under their own terms and privacy policies. Discord&apos;s privacy policy is available at <a href="https://discord.com/privacy" target="_blank" rel="noreferrer">discord.com/privacy</a>.</p>
          </>,
        },
        {
          title: 'Retention & Deletion',
          content: <>
            <p>OAuth state is retained only long enough to complete authorization. Website authentication cookies normally expire within 30 days. Security logs may be retained for up to 30 days unless a longer period is required to investigate abuse or comply with law. Bot interaction data is retained only when necessary for the requested feature.</p>
            <p>You may revoke access through Discord&apos;s Authorized Apps settings at any time. To request access, correction, or deletion, email <a href="mailto:connect@elvnx.org">connect@elvnx.org</a> with your Discord user ID. After identity verification, we will act promptly and ordinarily complete deletion within 30 days, except where retention is legally required.</p>
          </>,
        },
        {
          title: 'Security',
          content: <p>We use encrypted transport, restricted server-side secrets, HTTP-only cookies, role-based access checks, and limited-access infrastructure. No online service can guarantee absolute security; please report suspected vulnerabilities to <a href="mailto:connect@elvnx.org">connect@elvnx.org</a>.</p>,
        },
        {
          title: 'Children & International Processing',
          content: <p>The application is not directed to anyone under 13 or below the minimum digital-consent age in their jurisdiction. Data may be processed in countries where Discord, Cloudflare, Vercel, or our other infrastructure providers operate, subject to applicable safeguards.</p>,
        },
        {
          title: 'Changes & Contact',
          content: <p>We may update this policy when the application, law, or Discord requirements change. The effective date above identifies the current version. Questions, privacy requests, and application-related reports can be sent to <a href="mailto:connect@elvnx.org">connect@elvnx.org</a>.</p>,
        },
      ]}
    />
  );
}
