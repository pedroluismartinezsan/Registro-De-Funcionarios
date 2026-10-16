
const CACHE_NAME = "asistencia-cgr-quindio-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./offline.html",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

// Instalación y almacenamiento de recursos básicos.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// Activación y limpieza de versiones anteriores.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// Solo almacena recursos de la propia aplicación.
// No guarda respuestas del sistema de asistencia ni datos personales.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        return (
          await caches.match("./offline.html")
        ) || Response.error();
      })
    );

    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      return (
        await caches.match(request)
      ) || Response.error();
    })
  );
});
