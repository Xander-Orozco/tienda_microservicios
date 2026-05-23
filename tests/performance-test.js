import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// ── Configuración de etapas de carga ─────────────────────
export const options = {
  stages: [
    { duration: '15s', target: 10  },   // Rampa suave: 10 usuarios
    { duration: '20s', target: 50  },   // Carga media: 50 usuarios
    { duration: '20s', target: 100 },   // Carga alta:  100 usuarios
    { duration: '15s', target: 0   },   // Bajada gradual
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% de requests < 2s
    http_req_failed:   ['rate<0.05'],   // Menos del 5% de errores
  },
};

// ── Endpoint base (pasa por Traefik → api-gateway) ───────
const BASE = 'http://traefik';

export default function () {
  // Test 1: endpoint liviano — lista de productos
  const resProd = http.get(`${BASE}/productos`);
  check(resProd, {
    '[/productos] estado 200':          (r) => r.status === 200,
    '[/productos] tiempo < 500ms':      (r) => r.timings.duration < 500,
    '[/productos] respuesta es array':  (r) => {
      try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
    },
  });

  sleep(0.5);

  // Test 2: endpoint de pagos (consulta MongoDB)
  const resPagos = http.get(`${BASE}/pagos`);
  check(resPagos, {
    '[/pagos] estado 200':      (r) => r.status === 200,
    '[/pagos] tiempo < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}

// ── Reporte HTML al finalizar ─────────────────────────────
export function handleSummary(data) {
  return {
    '/scripts/reporte.html': htmlReport(data),
    '/scripts/reporte.json': JSON.stringify(data, null, 2),
  };
}