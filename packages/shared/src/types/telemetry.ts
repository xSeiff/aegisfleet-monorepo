export interface ClusterTelemetryMetric {
  clusterId: number;
  shards: number[];
  ramUsage: number;
  guildCount: number;
  ping: number;
  lastSeen: number;
}

export interface ClusterTelemetrySummary {
  totalClusters: number;
  totalGuilds: number;
  totalRamMb: number;
  avgPing: number;
}
