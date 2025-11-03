// Analytics service for tracking user interactions and performance

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class AnalyticsService {
  private isEnabled: boolean;
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' && typeof window !== 'undefined';
    this.sessionId = this.generateSessionId();

    if (this.isEnabled) {
      this.initializeAnalytics();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private initializeAnalytics() {
    // Initialize Vercel Analytics if available
    if (typeof window !== 'undefined' && (window as { va?: unknown }).va) {
      console.log('Vercel Analytics initialized');
    }

    // Track page views
    this.trackPageView();

    // Track performance metrics
    this.trackWebVitals();

    // Track user engagement
    this.trackUserEngagement();
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Track events
  track(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const enrichedEvent = {
      ...event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Send to Vercel Analytics
    const vercelAnalytics = (
      window as {
        va?: (action: string, name: string, properties?: Record<string, unknown>) => void;
      }
    ).va;
    if (vercelAnalytics) {
      vercelAnalytics('track', event.name, event.properties);
    }

    // Send to custom analytics endpoint
    this.sendToAnalytics('event', enrichedEvent);
  }

  // Track page views
  trackPageView(page?: string) {
    if (!this.isEnabled) return;

    const pageData = {
      page: page || window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    };

    this.track({
      name: 'page_view',
      properties: pageData,
    });
  }

  // Track performance metrics
  trackWebVitals() {
    if (!this.isEnabled) return;

    // Track Core Web Vitals (commented out for build compatibility)
    // if ('web-vitals' in window) {
    //   import('web-vitals').then(webVitals => {
    //     if (webVitals.onCLS) webVitals.onCLS(this.onPerfEntry);
    //     if (webVitals.onFID) webVitals.onFID(this.onPerfEntry);
    //     if (webVitals.onFCP) webVitals.onFCP(this.onPerfEntry);
    //     if (webVitals.onLCP) webVitals.onLCP(this.onPerfEntry);
    //     if (webVitals.onTTFB) webVitals.onTTFB(this.onPerfEntry);
    //   });
    // }

    // Track custom performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;

          this.trackPerformanceMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            unit: 'ms',
            timestamp: Date.now(),
          });

          this.trackPerformanceMetric({
            name: 'dom_content_loaded',
            value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            unit: 'ms',
            timestamp: Date.now(),
          });
        }, 0);
      });
    }
  }

  private onPerfEntry = (metric: { name: string; value: number; startTime: number }) => {
    this.trackPerformanceMetric({
      name: metric.name.toLowerCase(),
      value: metric.value,
      unit: 'ms',
      timestamp: Date.now(),
    });
  };

  trackPerformanceMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.sendToAnalytics('performance', {
      ...metric,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
    });
  }

  // Track user engagement
  trackUserEngagement() {
    if (!this.isEnabled) return;

    let startTime = Date.now();
    let isActive = true;

    // Track time on page
    const trackTimeOnPage = () => {
      if (isActive) {
        const timeSpent = Date.now() - startTime;
        this.track({
          name: 'time_on_page',
          properties: {
            duration: timeSpent,
            page: window.location.pathname,
          },
        });
      }
    };

    // Track when user becomes inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false;
        trackTimeOnPage();
      } else {
        isActive = true;
        startTime = Date.now();
      }
    };

    // Track before page unload
    const handleBeforeUnload = () => {
      trackTimeOnPage();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;

        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollDepth)) {
          this.track({
            name: 'scroll_depth',
            properties: {
              depth: scrollDepth,
              page: window.location.pathname,
            },
          });
        }
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
  }

  // Track specific user actions
  trackUserAction(action: string, properties?: Record<string, unknown>) {
    this.track({
      name: 'user_action',
      properties: {
        action,
        ...properties,
      },
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    this.track({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...context,
      },
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string, properties?: Record<string, unknown>) {
    this.track({
      name: 'feature_usage',
      properties: {
        feature,
        ...properties,
      },
    });
  }

  // Send data to analytics endpoint
  private async sendToAnalytics(type: string, data: Record<string, unknown>) {
    try {
      // Send to custom analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
        }),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Get session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
    };
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

export default analytics;

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, unknown>) => {
  analytics.track({ name, properties });
};

export const trackPageView = (page?: string) => {
  analytics.trackPageView(page);
};

export const trackUserAction = (action: string, properties?: Record<string, unknown>) => {
  analytics.trackUserAction(action, properties);
};

export const trackFeatureUsage = (feature: string, properties?: Record<string, unknown>) => {
  analytics.trackFeatureUsage(feature, properties);
};

export const trackError = (error: Error, context?: Record<string, unknown>) => {
  analytics.trackError(error, context);
};

export const setUserId = (userId: string) => {
  analytics.setUserId(userId);
};
