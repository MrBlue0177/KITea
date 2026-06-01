import type { Metadata } from "next"

import { LegalPage, LegalSection } from "@/components/legal/legal-page"
import { complianceConfig } from "@/lib/compliance"

export const metadata: Metadata = {
  title: "Impressum | KITea",
  description: "Legal notice for KITea according to German legal requirements.",
}

export default function ImpressumPage() {
  const { company } = complianceConfig

  return (
    <LegalPage
      title="Impressum"
      description="Legal notice for KITea. Replace all placeholders with the legally responsible operator details before publishing."
    >
      <LegalSection title="Information according to German legal notice requirements">
        <p>
          {company.legalName}
          <br />
          Represented by: {company.ownerName}
          <br />
          {company.address}
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Email: {company.email}
          <br />
          Phone: {company.phone}
        </p>
      </LegalSection>

      <LegalSection title="VAT identification number">
        <p>{company.vatId}</p>
      </LegalSection>

      <LegalSection title="Responsible for content">
        <p>
          {company.ownerName}
          <br />
          {company.address}
        </p>
      </LegalSection>

      <LegalSection title="Liability for content">
        <p>
          As a service provider, we are responsible for our own content on these pages under general laws. We are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general laws remain unaffected.
        </p>
      </LegalSection>

      <LegalSection title="Liability for links">
        <p>
          Our website may contain links to external third-party websites. We have no influence over their content and therefore cannot assume liability for external content. The respective provider or operator of linked pages is responsible for their content.
        </p>
      </LegalSection>

      <LegalSection title="Dispute resolution">
        <p>
          The European Commission provides a platform for online dispute resolution. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board unless legally required.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
