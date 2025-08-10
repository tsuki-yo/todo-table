# Service Level Indicators (SLIs) and Service Level Objectives (SLOs)

## Overview
This document defines the SLIs and SLOs for the Todo Application based on Google's Four Golden Signals framework.

## Golden Signals Implementation

### 1. Latency
**Definition**: How long it takes to service a request

**SLI**: 95th percentile response time for HTTP requests
- **Measurement**: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))`
- **Good Events**: Requests completed within SLO threshold
- **Total Events**: All HTTP requests

**SLO**: 95% of requests should complete within 500ms
- **Target**: ≤ 500ms for 95th percentile
- **Error Budget**: 5% of requests may exceed 500ms
- **Measurement Window**: 28-day rolling window

### 2. Traffic
**Definition**: How much demand is being placed on the system

**SLI**: Request rate per second
- **Measurement**: `sum(rate(http_requests_total[5m])) by (service)`
- **Baseline**: Historical average request rate

**SLO**: System should handle normal traffic patterns
- **Target**: Support up to 100 req/s per service without degradation
- **Alert Thresholds**:
  - Low: < 0.1 req/s (potential outage)
  - High: > 100 req/s (potential overload)

### 3. Errors
**Definition**: The rate of requests that fail

**SLI**: Error rate as percentage of total requests
- **Measurement**: `sum(rate(http_requests_total{code!~"2.."}[5m])) / sum(rate(http_requests_total[5m])) * 100`
- **Good Events**: HTTP responses with 2xx status codes
- **Total Events**: All HTTP requests

**SLO**: 99% availability (1% error rate maximum)
- **Target**: ≤ 1% error rate
- **Error Budget**: 1% of requests may return errors
- **Measurement Window**: 28-day rolling window

### 4. Saturation
**Definition**: How "full" the service is

**SLI**: Resource utilization (CPU, Memory, Network, Disk)
- **CPU**: `100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- **Memory**: `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`

**SLO**: Resource utilization should stay below capacity limits
- **CPU Target**: ≤ 80% utilization
- **Memory Target**: ≤ 80% utilization
- **Alert Threshold**: 80% sustained for 10 minutes

## Error Budget Policy

### Error Budget Calculation
- **Monthly Error Budget**: 1% of total requests
- **Burn Rate Monitoring**:
  - **Fast Burn**: 5x normal rate (5% errors) → Critical alert
  - **Slow Burn**: 2x normal rate (2% errors) → Warning alert

### Error Budget Actions
1. **Budget Remaining > 50%**: Deploy changes freely
2. **Budget Remaining 10-50%**: Require additional testing
3. **Budget Remaining < 10%**: Freeze deployments, focus on reliability

## SLO Monitoring and Alerting

### Alert Severity Levels
- **Critical**: SLO violation that affects user experience
- **Warning**: Early warning of potential SLO violation  
- **Info**: Informational alerts for capacity planning

### Dashboard Metrics
All Golden Signals are visualized in Grafana dashboard:
- **Latency**: 50th and 95th percentile response times
- **Traffic**: Request rate per service
- **Errors**: Error rate percentage by service
- **Saturation**: CPU and memory utilization

### Review Schedule
- **Weekly**: Review SLO performance and error budget burn rate
- **Monthly**: Assess SLO targets and adjust if needed
- **Quarterly**: Review overall reliability posture and set new objectives

## Implementation Details

### Instrumentation Requirements
Applications must expose Prometheus metrics including:
- `http_request_duration_seconds_bucket`: Request latency histogram
- `http_requests_total`: Counter with status code labels
- Standard CPU/memory metrics via node_exporter

### Data Sources
- **Application Metrics**: Scraped via ServiceMonitor from `/metrics` endpoint
- **Infrastructure Metrics**: Node exporter and cAdvisor
- **Alert Manager**: PrometheusRule objects for SLO violations

This SRE implementation provides a foundation for reliability engineering practices in a startup environment.