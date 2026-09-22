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
  },
  decorative: {
    reviewsLocationCard: `${selectedAssetBase}/decorative/decor-reviews-location-card.png`,
  },
  icons: {
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
  },
  illustrations: {
    businessOnboardingForm: `${selectedAssetBase}/illustrations/illus-business-onboarding-form.webp`,
    mobileCustomerChat: `${selectedAssetBase}/illustrations/illus-mobile-customer-chat.webp`,
    mobileLocalDiscovery: `${selectedAssetBase}/illustrations/illus-mobile-local-discovery.webp`,
    neighborhoodMapPins: `${selectedAssetBase}/illustrations/illus-neighborhood-map-pins.webp`,
    platformGrowthDashboard: `${selectedAssetBase}/illustrations/illus-platform-growth-dashboard.webp`,
    reviewsAndRatingsMobile: `${selectedAssetBase}/illustrations/illus-reviews-and-ratings-mobile.png`,
    storefrontDigitalProfile: `${selectedAssetBase}/illustrations/illus-storefront-digital-profile.webp`,
    taskSchedulePanel: `${selectedAssetBase}/illustrations/illus-task-schedule-panel.webp`,
  },
  social: {
    openGraph: `${selectedAssetBase}/og/og-vecidya-public.svg`,
  },
} as const;
