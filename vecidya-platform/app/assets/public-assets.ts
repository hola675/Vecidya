const selectedAssetBase = "/assets/selected";

export const publicAssets = {
  backgrounds: {
    heroMapWave: `${selectedAssetBase}/backgrounds/bg-hero-soft-map-wave.png`,
    networkRoutePins: `${selectedAssetBase}/backgrounds/bg-network-route-pins.png`,
    sectionMapWaveDark: `${selectedAssetBase}/backgrounds/bg-section-map-wave-dark.png`,
    softMapOrangeBlue: `${selectedAssetBase}/backgrounds/bg-soft-map-orange-blue.png`,
  },
  brand: {
    symbol: `${selectedAssetBase}/brand/brand-symbol-primary.png`,
  },
  decorative: {
    reviewsLocationCard: `${selectedAssetBase}/decorative/decor-reviews-location-card.png`,
  },
  icons: {
    search: `${selectedAssetBase}/icons/ui/ui-icon-search.png`,
    storefrontVerified: `${selectedAssetBase}/icons/ui/ui-icon-storefront-verified.png`,
    vecidyaPin: `${selectedAssetBase}/icons/ui/ui-icon-vecidya-pin.png`,
  },
  illustrations: {
    businessOnboardingForm: `${selectedAssetBase}/illustrations/illus-business-onboarding-form.png`,
    mobileCustomerChat: `${selectedAssetBase}/illustrations/illus-mobile-customer-chat.png`,
    mobileLocalDiscovery: `${selectedAssetBase}/illustrations/illus-mobile-local-discovery.png`,
    neighborhoodMapPins: `${selectedAssetBase}/illustrations/illus-neighborhood-map-pins.png`,
    platformGrowthDashboard: `${selectedAssetBase}/illustrations/illus-platform-growth-dashboard.png`,
    reviewsAndRatingsMobile: `${selectedAssetBase}/illustrations/illus-reviews-and-ratings-mobile.png`,
    storefrontDigitalProfile: `${selectedAssetBase}/illustrations/illus-storefront-digital-profile.png`,
    taskSchedulePanel: `${selectedAssetBase}/illustrations/illus-task-schedule-panel.png`,
  },
} as const;
