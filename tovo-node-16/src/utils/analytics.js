/**
 * Analytics utility that respects user consent
 * Falls back to noop functions if analytics is disabled
 */

import { consentManager, CONSENT_KEYS } from './consentManager';

// Check if analytics consent is given
const hasAnalyticsConsent = () => {
  return consentManager.hasConsent(CONSENT_KEYS.ANALYTICS);
};

// Check if analytics is enabled in environment
const isAnalyticsEnabled = () => {
  return process.env.NODE_ENV === 'production' && hasAnalyticsConsent();
};

// Noop function for when analytics is disabled
const noop = () => {};

// Analytics tracking functions
const analytics = {
  // Track theme selection
  onThemeSelect: (themeId, additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'theme_selected',
      properties: {
        themeId,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    // In a real app, this would send to your analytics service
    console.log('Analytics: Theme Selected', eventData);
    
    // Example: Send to analytics service
    // analyticsService.track('theme_selected', eventData.properties);
  },

  // Track mode changes
  onModeChange: (mode, additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'mode_changed',
      properties: {
        mode,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    console.log('Analytics: Mode Changed', eventData);
  },

  // Track advanced configuration opening
  onOpenAdvanced: (additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'advanced_opened',
      properties: {
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    console.log('Analytics: Advanced Opened', eventData);
  },

  // Track theme save
  onSave: (themeId, mode, tokensChanged, additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'theme_saved',
      properties: {
        themeId,
        mode,
        tokensChanged,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    console.log('Analytics: Theme Saved', eventData);
  },

  // Track theme reset
  onReset: (additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'theme_reset',
      properties: {
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    console.log('Analytics: Theme Reset', eventData);
  },

  // Track custom color changes
  onCustomColorChange: (tokenType, color, additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'custom_color_changed',
      properties: {
        tokenType,
        color,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    console.log('Analytics: Custom Color Changed', eventData);
  },

  // Track preset theme selection
  onPresetSelect: (presetId, mode, additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'preset_selected',
      properties: {
        presetId,
        mode,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    console.log('Analytics: Preset Selected', eventData);
  },

  // Track custom theme CTA clicks
  onCustomThemeCTA: (location, additionalData = {}) => {
    if (!isAnalyticsEnabled()) return noop();
    
    const eventData = {
      event: 'custom_theme_cta_clicked',
      properties: {
        location, // 'presets_list' or 'advanced_config'
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };
    
    console.log('Analytics: Custom Theme CTA Clicked', eventData);
  }
};

// Export consent manager for external use
export { consentManager };

export default analytics;
