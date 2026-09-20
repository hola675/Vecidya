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
    search: `${selectedAssetBase}/icons/ui/ui-icon-search.png`,
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
} as const;
