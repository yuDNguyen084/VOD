# VOD-CloudStream Platform - Performance & Load Testing Metrics
---

## 1. System Saturation & Extreme Load Test (k6 Stress Test)
**Objective:** Identify the saturation point and absolute limit of the Node.js API before latency degradation.
*   **Virtual Users (VUs):** Ramp-up to 800 VUs (Max: 800)
*   **Total Requests Processed:** 292,549 requests
*   **Throughput:** 904.35 req/sec
*   **Success Rate:** 100% (0.00% failure rate)
*   **Network Data Transferred:** 1.9 GB received / 28 MB sent
*   **Latency Metrics:**
    *   Average: 209.86ms
    *   Median (p50): 133.82ms
    *   p90: 486.33ms
    *   p95: 559.73ms (Threshold crossed under extreme load)

## 2. API Resilience Test (k6 Load Test - GET)
**Objective:** Validate Node.js API isolation and response times under stable load while background workers process heavy tasks.
*   **Virtual Users (VUs):** 50 VUs (Stable)
*   **Throughput:** ~380.00 req/sec (Peak test showed ~457.22 req/sec)
*   **Success Rate:** 100% (0 errors)
*   **Latency Metrics:**
    *   Average: 30.61ms
    *   Median (p50): 20.12ms (Peak test median: 107.31ms)
    *   p90: 57.16ms
    *   p95: 94.1ms (Peak test p95: 120.41ms)

## 3. Go Worker Concurrency Limit Test (k6 POST & Docker Stats)
**Objective:** Flood the Redis queue to ensure the bounded Go worker pool prevents Out-Of-Memory (OOM) crashes under heavy FFmpeg loads.
*   **Total Jobs Queued:** 1,160 jobs in 1 minute (~19.5 jobs/sec).
*   **Queue Success Rate:** 100% non-blocking push to Redis.
*   **Resource Isolation (Docker Stats during peak FFmpeg load):**
    *   **`vod-worker` (Go):** CPU 1644.61% | RAM 3.907 GiB (Capped at 2 Goroutines/Channels, well below 7.62 GiB limit).
    *   **`vod-api` (Node.js):** CPU 0.09% | RAM 71.15 MiB (Completely isolated, maintaining ultra-low footprint).
    *   **`vod-postgres`:** CPU 5.39% | RAM 66.66 MiB.
    *   **`vod-redis`:** CPU 4.86% | RAM 4.98 MiB.