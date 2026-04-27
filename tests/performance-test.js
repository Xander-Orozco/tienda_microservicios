import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
 
export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '20s', target: 30 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 0 },
  ],
};
 
export default function () {
  const respuesta = http.get('http://catalog-service:3002/productos');
 
  check(respuesta, {
    'estado 200': (r) => r.status === 200,
    'tiempo menor a 500ms': (r) => r.timings.duration < 500,
  });
 
  sleep(1);
}
 
export function handleSummary(data) {
  return {
    '/scripts/reporte.html': htmlReport(data),
    '/scripts/reporte.json': JSON.stringify(data, null, 2),
  };
}