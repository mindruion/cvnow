/**
 * Consent management utility for analytics
 * Provides methods to check, set, and manage user consent
 */

export const CONSENT_KEYS = {
  ANALYTICS: 'analytics_consent',
  MARKETING: 'marketing_consent',
  FUNCTIONAL: 'functional_consent'
};

export const consentManager = {
  // Check if user has given consent for a specific type
  hasConsent: (consentType = CONSENT_KEYS.ANALYTICS) => {
    try {
      const consent = localStorage.getItem(consentType);
      return consent === 'true';
    } catch (error) {
      console.warn('Failed to check consent:', error);
      return false;
    }
  },

  // Set user consent for a specific type
  setConsent: (consentType = CONSENT_KEYS.ANALYTICS, hasConsent = true) => {
    try {
      localStorage.setItem(consentType, hasConsent.toString());
      return true;
    } catch (error) {
      console.warn('Failed to set consent:', error);
      return false;
    }
  },

  // Remove consent for a specific type
  removeConsent: (consentType = CONSENT_KEYS.ANALYTICS) => {
    try {
      localStorage.removeItem(consentType);
      return true;
    } catch (error) {
      console.warn('Failed to remove consent:', error);
      return false;
    }
  },

  // Get all consent preferences
  getAllConsent: () => {
    try {
      return {
        analytics: consentManager.hasConsent(CONSENT_KEYS.ANALYTICS),
        marketing: consentManager.hasConsent(CONSENT_KEYS.MARKETING),
        functional: consentManager.hasConsent(CONSENT_KEYS.FUNCTIONAL)
      };
    } catch (error) {
      console.warn('Failed to get all consent:', error);
      return {
        analytics: false,
        marketing: false,
        functional: false
      };
    }
  },

  // Set all consent preferences at once
  setAllConsent: (preferences) => {
    try {
      Object.entries(preferences).forEach(([key, value]) => {
        const consentKey = CONSENT_KEYS[key.toUpperCase()];
        if (consentKey) {
          consentManager.setConsent(consentKey, value);
        }
      });
      return true;
    } catch (error) {
      console.warn('Failed to set all consent:', error);
      return false;
    }
  },

  // Clear all consent preferences
  clearAllConsent: () => {
    try {
      Object.values(CONSENT_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.warn('Failed to clear all consent:', error);
      return false;
    }
  }
};

export default consentManager;
