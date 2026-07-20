/**
 * Production-ready Metrics Logger for Activity Module.
 * Outputs structured JSON logs that can be ingested by Datadog, Prometheus Exporters, or Grafana Promtail.
 */
export const recordMetric = (metricName, durationMs, metadata = {}) => {
  const payload = {
    type: "METRIC",
    metric: metricName,
    durationMs,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  // In production, this can be streamed to stdout, an APM agent, or an event bus
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_METRICS === "true") {
    console.info(JSON.stringify(payload));
  } else {
    // Development-friendly logging
    console.log(`[Metric] ${metricName} took ${durationMs}ms`);
  }
};
