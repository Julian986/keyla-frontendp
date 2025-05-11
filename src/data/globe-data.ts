// src/data/globe-data.ts
export const sampleData = [
  // Ejemplo: Conexión desde Mar del Plata a Buenos Aires
  {
    order: 1,
    startLat: -38.0055,  // Mar del Plata (Argentina)
    startLng: -57.5426,
    endLat: -34.6037,    // Buenos Aires
    endLng: -58.3816,
    arcAlt: 0.2,         // Altura del arco (ajusta según prefieras)
    color: "#3a86ff",    // Color del arco (azul)
  },
  // Ejemplo: Conexión desde Mar del Plata a Madrid
  {
    order: 2,
    startLat: -38.0055,  // Mar del Plata
    startLng: -57.5426,
    endLat: 40.4168,     // Madrid (España)
    endLng: -3.7038,
    arcAlt: 0.3,
    color: "#ff4d4d",    // Color rojo
  },
  // Ejemplo: Conexión desde Mar del Plata a Sydney
  {
    order: 3,
    startLat: -38.0055,  // Mar del Plata
    startLng: -57.5426,
    endLat: -33.8688,    // Sydney (Australia)
    endLng: 151.2093,
    arcAlt: 0.4,
    color: "#00b894",    // Color verde
  },
  // Más rutas...
];