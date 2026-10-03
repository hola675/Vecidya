const selectedAssetBase = "/assets/selected";

export const publicAssets = {
  backgrounds: {
    heroMapWave: `${selectedAssetBase}/backgrounds/bg-hero-soft-map-wave.webp`,
    networkRoutePins: `${selectedAssetBase}/backgrounds/bg-network-route-pins.webp`,
    sectionMapWaveDark: `${selectedAssetBase}/backgrounds/bg-section-map-wave-dark.webp`,
    softMapOrangeBlue: `${selectedAssetBase}/backgrounds/bg-soft-map-orange-blue.webp`,
  },
  brand: {
    symbol: `${selectedAssetBase}/brand/brand-symbol-primary.webp`,
    /** 96 px, derivado del símbolo principal para el informe PDF (DIAG-V3-12): el original de 1254 px inflaba cada PDF. */
    symbolPrint: `${selectedAssetBase}/brand/brand-symbol-report.webp`,
    symbol3d: `${selectedAssetBase}/brand/brand-symbol-3d.webp`,
    wordmark: `${selectedAssetBase}/brand/brand-wordmark.webp`,
    lockup: `${selectedAssetBase}/brand/brand-lockup-tagline.webp`,
  },
  about: {
    team: "/assets/about/team-yoan-edgar.webp",
    teamMobile: "/assets/about/team-yoan-edgar-mobile.webp",
    yoan: "/assets/about/yoan-profile.webp",
    edgar: "/assets/about/edgar-profile.webp",
  },
  decorative: {
    reviewsLocationCard: `${selectedAssetBase}/decorative/decor-reviews-location-card.png`,
  },
  icons: {
    diagnosticStatusPriority: `${selectedAssetBase}/icons/status/diagnostic-status-priority.webp`,
    diagnosticStatusDeveloping: `${selectedAssetBase}/icons/status/diagnostic-status-developing.webp`,
    diagnosticStatusHealthy: `${selectedAssetBase}/icons/status/diagnostic-status-healthy.webp`,
    diagnosticBusiness: `${selectedAssetBase}/icons/diagnostic-business.svg`,
    diagnosticProfessional: `${selectedAssetBase}/icons/diagnostic-professional.svg`,
    diagnosticProject: `${selectedAssetBase}/icons/diagnostic-project.svg`,
    diagnosticCreator: `${selectedAssetBase}/icons/diagnostic-creator.svg`,
    search: `${selectedAssetBase}/icons/ui/ui-icon-search.png`,
    serviceStructure: `${selectedAssetBase}/icons/service-structure.svg`,
    serviceFormalization: `${selectedAssetBase}/icons/service-formalization.svg`,
    serviceDigitalPresence: `${selectedAssetBase}/icons/service-digital-presence.svg`,
    serviceVisibility: `${selectedAssetBase}/icons/service-visibility.svg`,
    storefrontVerified: `${selectedAssetBase}/icons/ui/ui-icon-storefront-verified.webp`,
    vecidyaPin: `${selectedAssetBase}/icons/ui/ui-icon-vecidya-pin.webp`,
    whatsapp: `${selectedAssetBase}/icons/ui/ui-icon-whatsapp.svg`,
  },
  illustrations: {
    diagnosticStatusLow: `${selectedAssetBase}/illustrations/diagnostic-status-low.webp`,
    diagnosticStatusDeveloping: `${selectedAssetBase}/illustrations/diagnostic-status-developing.webp`,
    diagnosticStatusSolid: `${selectedAssetBase}/illustrations/diagnostic-status-solid.webp`,
    adminEmptySearch: `${selectedAssetBase}/illustrations/illus-admin-empty-search.webp`,
    servicesEmptyConnection: `${selectedAssetBase}/illustrations/illus-services-empty-connection.webp`,
    businessOnboardingForm: `${selectedAssetBase}/illustrations/illus-business-onboarding-form.webp`,
    mobileCustomerChat: `${selectedAssetBase}/illustrations/illus-mobile-customer-chat.webp`,
    mobileLocalDiscovery: `${selectedAssetBase}/illustrations/illus-mobile-local-discovery.webp`,
    neighborhoodMapPins: `${selectedAssetBase}/illustrations/illus-neighborhood-map-pins.webp`,
    platformGrowthDashboard: `${selectedAssetBase}/illustrations/illus-platform-growth-dashboard.webp`,
    reviewsAndRatingsMobile: `${selectedAssetBase}/illustrations/illus-reviews-and-ratings-mobile.png`,
    storefrontDigitalProfile: `${selectedAssetBase}/illustrations/illus-storefront-digital-profile.webp`,
    taskSchedulePanel: `${selectedAssetBase}/illustrations/illus-task-schedule-panel.webp`,
  },
  learn: {
    crm: "/assets/learn/diagram-crm.svg",
    ai: "/assets/learn/diagram-ai.svg",
    automation: "/assets/learn/diagram-automation.svg",
  },
  social: {
    openGraph: `${selectedAssetBase}/og/og-vecidya-public.svg`,
  },
} as const;
