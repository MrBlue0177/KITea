export type CookieCategory = {
  id: "essential" | "analytics" | "preferences"
  label: string
  description: string
  required: boolean
}

export const complianceConfig = {
  company: {
    siteName: "KITea",
    legalName: process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME ?? "[LEGAL COMPANY NAME]",
    ownerName: process.env.NEXT_PUBLIC_LEGAL_OWNER_NAME ?? "[LEGAL OWNER NAME]",
    address:
      process.env.NEXT_PUBLIC_LEGAL_ADDRESS ??
      "[STREET AND HOUSE NUMBER], [POSTAL CODE] [CITY], Germany",
    email: process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "[CONTACT EMAIL]",
    phone: process.env.NEXT_PUBLIC_LEGAL_PHONE ?? "[PHONE NUMBER]",
    vatId: process.env.NEXT_PUBLIC_LEGAL_VAT_ID ?? "[VAT ID IF APPLICABLE]",
  },
  privacy: {
    lastUpdated: "2026-05-25",
    jurisdiction: "Germany / European Union",
    supervisoryAuthority:
      process.env.NEXT_PUBLIC_DATA_PROTECTION_AUTHORITY ??
      "[RESPONSIBLE DATA PROTECTION AUTHORITY]",
    hostingProvider:
      process.env.NEXT_PUBLIC_HOSTING_PROVIDER ?? "[HOSTING PROVIDER]",
    hostingRegion:
      process.env.NEXT_PUBLIC_HOSTING_REGION ?? "European Union or configured provider region",
    supportEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "[PRIVACY CONTACT EMAIL]",
  },
  features: {
    analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
    googleOAuthEnabled: true,
  },
  cookies: [
    {
      id: "essential",
      label: "Essential cookies",
      description:
        "Required for security, authentication, session handling, cookie consent storage, and basic website functionality.",
      required: true,
    },
    {
      id: "preferences",
      label: "Preference cookies",
      description:
        "Remember interface preferences such as theme and privacy choices where applicable.",
      required: false,
    },
    {
      id: "analytics",
      label: "Analytics cookies",
      description:
        "Help us understand usage and improve KITea. These are disabled until you consent.",
      required: false,
    },
  ] satisfies CookieCategory[],
}
