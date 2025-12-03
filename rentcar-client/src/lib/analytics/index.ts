import * as Sentry from '@sentry/react'
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

type AnalyticsEvent = {
  action: string
  params?: Record<string, unknown>
}

let initialized = false

const sendToDataLayer = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: event.action,
    ...event.params,
  })
}

const loadGAScript = (measurementId: string) => {
  if (typeof document === 'undefined') return
  if (document.getElementById('ga-script')) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script.id = 'ga-script'

  const inlineScript = document.createElement('script')
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `

  document.head.appendChild(script)
  document.head.appendChild(inlineScript)
}

const initWebVitals = () => {
  const handler = (metric: Metric) => {
    trackEvent('web_vital', {
      name: metric.name,
      value: Math.round(metric.value),
      id: metric.id,
    })
  }

  onCLS(handler)
  onFCP(handler)
  onFID(handler)
  onINP(handler)
  onLCP(handler)
  onTTFB(handler)
}

export const initObservability = () => {
  if (initialized) return

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.2),
      replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAY_SAMPLE_RATE ?? 0.1),
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
    })
  }

  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (gaMeasurementId) {
    loadGAScript(gaMeasurementId)
  }

  initWebVitals()
  initialized = true
}

export const trackEvent = (action: string, params?: Record<string, unknown>) => {
  sendToDataLayer({ action, params })
}

export const logError = (error: unknown, context?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.error(error, context)
  }

  Sentry.captureException(error, { extra: context })
}

export const logInfo = (message: string, context?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.info(message, context)
  }

  Sentry.captureMessage(message, {
    level: 'info',
    extra: context,
  })
}

