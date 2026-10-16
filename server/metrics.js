/* ============================================================
   MEUVOTO — Métricas Prometheus (sem dependências externas)
   ------------------------------------------------------------
   Coleta contadores e histogramas em memória e os expõe no
   formato Prometheus text/plain em /api/metrics.

   Uso:
     const metrics = require('./metrics');
     metrics.inc('http_requests_total', { method: 'GET', path: '/api/health', status: '200' });
     metrics.observe('http_request_duration_ms', 42, { path: '/api/health' });
     metrics.gauge('node_memory_heap_used', process.memoryUsage().heapUsed);

   Endpoint:
     GET /api/metrics  →  texto no formato Prometheus
   ============================================================ */

const os = require('os');

// Registries: nome -> { type, help, values: { labelKey: { labels, value } } }
const registries = new Map();

function ensureRegistry(name, type, help) {
  let r = registries.get(name);
  if (!r) {
    r = { type, help, values: new Map() };
    registries.set(name, r);
  }
  return r;
}

function labelKey(labels) {
  if (!labels) return '';
  return Object.keys(labels).sort().map(k => `${k}="${labels[k]}"`).join(',');
}

const metrics = {
  /** Incrementa um counter em 1 (ou amount). */
  inc: (name, labels = {}, amount = 1) => {
    const r = ensureRegistry(name, 'counter', name);
    const key = labelKey(labels);
    const existing = r.values.get(key) || { labels, value: 0 };
    existing.value += amount;
    r.values.set(key, existing);
  },

  /** Define o valor de uma gauge. */
  gauge: (name, value, labels = {}) => {
    const r = ensureRegistry(name, 'gauge', name);
    const key = labelKey(labels);
    r.values.set(key, { labels, value });
  },

  /** Observa um valor em um histogram (simples: mantém soma + count + max). */
  observe: (name, value, labels = {}) => {
    const r = ensureRegistry(name, 'histogram', name);
    const key = labelKey(labels);
    const existing = r.values.get(key) || { labels, count: 0, sum: 0, max: 0 };
    existing.count += 1;
    existing.sum += value;
    if (value > existing.max) existing.max = value;
    r.values.set(key, existing);
  },

  /** Reseta todas as métricas (útil para testes). */
  reset: () => registries.clear(),

  /** Exporta todas as métricas no formato Prometheus text/plain. */
  prometheus: () => {
    const lines = [];
    for (const [name, r] of registries) {
      lines.push(`# HELP ${name} ${r.help}`);
      lines.push(`# TYPE ${name} ${r.type}`);
      for (const [, entry] of r.values) {
        const labels = entry.labels
          ? '{' + Object.keys(entry.labels).sort().map(k => `${k}="${entry.labels[k]}"`).join(',') + '}'
          : '';
        if (r.type === 'histogram') {
          lines.push(`${name}_sum${labels} ${entry.sum}`);
          lines.push(`${name}_count${labels} ${entry.count}`);
          lines.push(`${name}_max${labels} ${entry.max}`);
        } else {
          lines.push(`${name}${labels} ${entry.value}`);
        }
      }
    }
    return lines.join('\n') + '\n';
  },

  /** Coleta métricas automáticas do sistema (memória, event loop, etc.). */
  collectSystem: () => {
    const mem = process.memoryUsage();
    metrics.gauge('node_memory_heap_used', mem.heapUsed);
    metrics.gauge('node_memory_heap_total', mem.heapTotal);
    metrics.gauge('node_memory_rss', mem.rss);
    metrics.gauge('node_uptime_seconds', process.uptime());
    metrics.gauge('node_pid', process.pid);
    metrics.gauge('node_platform', os.platform() === 'win32' ? 1 : 0);
  }
};

module.exports = metrics;