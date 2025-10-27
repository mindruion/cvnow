/**
 * Example usage of analytics and consent management
 * This file demonstrates how to use the analytics system
 */

import analytics, { consentManager } from '../utils/analytics';

// Example: Setting up consent
export const setupConsent = () => {
  // Set analytics consent
  consentManager.setConsent('analytics_consent', true);
  
  // Or set multiple consents at once
  consentManager.setAllConsent({
    analytics: true,
    marketing: false,
    functional: true
  });
};

// Example: Checking consent before tracking
export const trackUserAction = (action, data) => {
  if (consentManager.hasConsent('analytics_consent')) {
    // Track the action
    analytics.onThemeSelect('example_theme', data);
  } else {
    console.log('Analytics disabled - not tracking user action');
  }
};

// Example: Consent banner component
export const ConsentBanner = () => {
  const handleAccept = () => {
    consentManager.setConsent('analytics_consent', true);
    // Reload page or update UI to reflect consent
  };

  const handleDecline = () => {
    consentManager.setConsent('analytics_consent', false);
    // Reload page or update UI to reflect consent
  };

  return (
    <div className="consent-banner">
      <p>We use analytics to improve your experience. Do you consent?</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleDecline}>Decline</button>
    </div>
  );
};

export default ConsentBanner;
