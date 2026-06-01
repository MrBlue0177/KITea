import type { Metadata } from "next"
import Link from "next/link"

import { LegalPage, LegalSection } from "@/components/legal/legal-page"
import { complianceConfig } from "@/lib/compliance"

export const metadata: Metadata = {
  title: "Privacy Policy | KITea",
  description: "Privacy policy and GDPR information for KITea.",
}

export default function PrivacyPolicyPage() {
  const { company, privacy, features } = complianceConfig

  return (
    <LegalPage
      title="Privacy Policy"
      description="This page explains how KITea processes personal data, which services may be involved, and which rights you have under the GDPR. Replace all placeholders before production deployment."
    >
      <LegalSection title="Controller">
        <p>
          The controller responsible for this website is {company.legalName}, represented by {company.ownerName}, {company.address}. You can contact us at {company.email}. Privacy requests can be sent to {privacy.supportEmail}.
        </p>
      </LegalSection>

      <LegalSection title="Data we process">
        <p>
          KITea may process account data, authentication data, profile data, submitted module reviews, technical request data, consent preferences, and communication data that you provide to us.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Account data: name, email address, profile image, provider account identifier, and session metadata.</li>
          <li>Review data: module ratings, review text, semester information, lecturer or tutor names if voluntarily submitted.</li>
          <li>Technical data: IP address, user agent, timestamps, requested URLs, security events, and server logs.</li>
          <li>Consent data: selected cookie and privacy preferences stored locally in your browser.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Purposes and legal bases">
        <p>
          We process personal data to provide the website, authenticate users, publish and manage module reviews, secure the service, prevent abuse, comply with legal obligations, and improve the product where consent has been given.
        </p>
        <p>
          Legal bases may include Art. 6(1)(b) GDPR for providing requested services, Art. 6(1)(f) GDPR for security and abuse prevention, Art. 6(1)(c) GDPR for legal obligations, and Art. 6(1)(a) GDPR where optional consent is required.
        </p>
      </LegalSection>

      <LegalSection title="Google OAuth">
        <p>
          If you sign in with Google, Google Ireland Limited may process authentication-related data. KITea receives basic profile information such as your name, email address, profile image, and Google account identifier to create and manage your account. Google may process data under its own privacy terms.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          Essential cookies are used for authentication, security, session handling, and consent storage. Optional categories such as analytics or preferences are disabled until you consent. You can change your choice at any time via Cookie Settings in the footer.
        </p>
      </LegalSection>

      <LegalSection title="Analytics and tracking">
        <p>
          Analytics are currently configured as {features.analyticsEnabled ? "enabled by configuration" : "disabled by configuration"}. If analytics are enabled, they must only load after consent and should use privacy-friendly settings such as IP anonymization where supported.
        </p>
      </LegalSection>

      <LegalSection title="Hosting, APIs, and server logs">
        <p>
          This website may be hosted by {privacy.hostingProvider} in {privacy.hostingRegion}. Hosting providers process technical request data and server logs to deliver the service securely and reliably. External APIs may process only the data required for their specific function.
        </p>
      </LegalSection>

      <LegalSection title="Storage periods">
        <p>
          Account and review data are stored while your account exists or while the data is required for the service. Server logs should be deleted or anonymized after a reasonable security retention period. Consent preferences remain stored until changed or cleared in your browser.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You have the right to access, rectification, erasure, restriction of processing, data portability, objection, and withdrawal of consent. You may also lodge a complaint with a supervisory authority, including {privacy.supervisoryAuthority}.
        </p>
      </LegalSection>

      <LegalSection title="Contact and updates">
        <p>
          For privacy requests, contact {privacy.supportEmail}. This policy was last updated on {privacy.lastUpdated}. You should review this text with qualified legal counsel before production use.
        </p>
        <p>
          See also our <Link href="/terms-of-service" className="underline underline-offset-4 hover:text-foreground">Terms of Service</Link> and <Link href="/impressum" className="underline underline-offset-4 hover:text-foreground">Impressum</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
