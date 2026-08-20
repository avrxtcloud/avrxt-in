import DiscordLegalPage from '@/components/DiscordLegalPage';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
  title: 'Discord App Terms of Service',
  description: 'Terms governing use of the AVRXT Discord bot application and Discord OAuth authentication.',
  keywords: ['AVRXT Discord bot terms', 'Discord application terms', 'Discord OAuth terms'],
  path: '/dc/terms',
});

export default function DiscordTermsPage() {
  return (
    <DiscordLegalPage
      label="// Discord Application / Terms"
      title="Terms of Service_"
      summary="These terms govern your use of the AVRXT Discord application, its bot functionality, and Discord-based authentication for AVRXT services. By installing, authorizing, or using the application, you agree to these terms."
      counterpartHref="/dc/privacy"
      counterpartLabel="Discord App Privacy"
      sections={[
        {
          title: 'Eligibility & Acceptance',
          content: <p>You must be at least 13 years old and meet the minimum age required in your country. If you cannot legally agree to these terms, a parent or guardian must do so for you. You must also comply with the <a href="https://discord.com/terms" target="_blank" rel="noreferrer">Discord Terms of Service</a>, Community Guidelines, and all applicable laws.</p>,
        },
        {
          title: 'Application Functionality',
          content: <p>The application provides Discord OAuth sign-in, server membership and role verification, bot commands, and related AVRXT integrations. Features may change, be limited, or be discontinued. Authorization does not guarantee access to restricted areas; required server roles or explicit owner authorization may still apply.</p>,
        },
        {
          title: 'Permissions & Server Installation',
          content: <p>Only a person with appropriate authority may install the application in a Discord server or grant permissions on that server&apos;s behalf. You must not grant permissions you are not authorized to grant. You may remove the bot, revoke OAuth access, or stop using the application at any time.</p>,
        },
        {
          title: 'Acceptable Use',
          content: <ul>
            <li>Do not misuse commands, automate abuse, spam, harass, deceive, or impersonate others.</li>
            <li>Do not probe, disrupt, overload, reverse engineer, or bypass security or access controls.</li>
            <li>Do not use the application for unlawful, dangerous, infringing, fraudulent, or age-restricted activity.</li>
            <li>Do not use the application to violate Discord&apos;s platform rules or another person&apos;s privacy or rights.</li>
          </ul>,
        },
        {
          title: 'Privacy & API Data',
          content: <p>Our handling of Discord API data is described in the <a href="/dc/privacy">Discord App Privacy Policy</a>. You authorize the processing necessary to provide the features you request. Discord remains responsible for its own platform and processing under its policies.</p>,
        },
        {
          title: 'Availability & Changes',
          content: <p>The application is provided on an &quot;as available&quot; basis. We may update commands, permissions, integrations, eligibility rules, or these terms; suspend service for maintenance or security; and limit access to protect users or infrastructure. We do not guarantee uninterrupted or error-free operation.</p>,
        },
        {
          title: 'Suspension & Termination',
          content: <p>We may suspend or terminate access when we reasonably believe these terms, Discord&apos;s rules, law, or security requirements have been violated. Server administrators may remove the application, and users may revoke authorization. Provisions concerning intellectual property, disclaimers, liability, and disputes survive termination where legally applicable.</p>,
        },
        {
          title: 'Intellectual Property',
          content: <p>AVRXT retains rights in the application, branding, code, interface, and original content. Discord and third parties retain rights in their respective names, services, content, and assets. These terms grant only a limited, revocable, non-transferable right to use the application as provided.</p>,
        },
        {
          title: 'Disclaimers & Liability',
          content: <p>To the maximum extent permitted by law, the application is provided without warranties of merchantability, fitness for a particular purpose, non-infringement, or continuous availability. AVRXT will not be liable for indirect, incidental, special, consequential, or punitive damages, lost data, lost profits, Discord outages, server actions, or third-party services arising from use of the application.</p>,
        },
        {
          title: 'Governing Law & Contact',
          content: <p>These terms are governed by the laws of India, without regard to conflict-of-law principles. Courts with competent jurisdiction in Kerala, India will have jurisdiction where permitted by law. Support requests, abuse reports, and legal notices may be sent to <a href="mailto:connect@elvnx.org">connect@elvnx.org</a>.</p>,
        },
      ]}
    />
  );
}
