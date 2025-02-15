const cacheName = "currency-converter-v1";
const filesToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "https://cdn.jsdelivr.net/npm/chart.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
