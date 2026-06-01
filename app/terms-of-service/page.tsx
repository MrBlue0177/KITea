import type { Metadata } from "next"
import Link from "next/link"

import { LegalPage, LegalSection } from "@/components/legal/legal-page"
import { complianceConfig } from "@/lib/compliance"

export const metadata: Metadata = {
  title: "Terms of Service | KITea",
  description: "Terms of Service for KITea.",
}

export default function TermsOfServicePage() {
  const { company, privacy } = complianceConfig

  return (
    <LegalPage
      title="Terms of Service"
      description="These terms define the basic rules for using KITea. Replace placeholders and obtain legal review before production deployment."
    >
      <LegalSection title="Provider">
        <p>
          KITea is operated by {company.legalName}, represented by {company.ownerName}, {company.address}. Contact: {company.email}.
        </p>
      </LegalSection>

      <LegalSection title="Purpose of the service">
        <p>
          KITea allows students to browse and submit module reviews. The service is provided to support informed study decisions and constructive academic exchange.
        </p>
      </LegalSection>

      <LegalSection title="User responsibilities">
        <p>
          You are responsible for the content you submit. Reviews must be truthful, respectful, lawful, and must not contain hate speech, harassment, confidential information, spam, malware, or unlawful personal data about others.
        </p>
      </LegalSection>

      <LegalSection title="Accounts and authentication">
        <p>
          Some features require signing in with Google. You must keep access to your account secure and notify us if you suspect misuse. We may restrict access if the service is abused or legal obligations require it.
        </p>
      </LegalSection>

      <LegalSection title="Moderation and removal">
        <p>
          We may remove, hide, or restrict content that violates these terms, infringes rights, creates legal risk, or harms the integrity of the platform. We may also respond to valid legal complaints and data protection requests.
        </p>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We aim to provide a reliable service, but availability is not guaranteed. Features may change, be limited, or be discontinued where necessary for technical, legal, or operational reasons.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          KITea does not guarantee the accuracy, completeness, or usefulness of user-generated reviews. Liability is limited according to applicable law. Nothing in these terms limits liability where limitation is legally not permitted.
        </p>
      </LegalSection>

      <LegalSection title="Account deletion and data rights">
        <p>
          You may request deletion or export of your personal data by contacting {privacy.supportEmail}. Dedicated self-service controls will be added in a later compliance phase. More information is available in the <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Applicable law">
        <p>
          These terms are intended for operation in Germany and the European Union. Mandatory consumer protection and data protection rights remain unaffected.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
