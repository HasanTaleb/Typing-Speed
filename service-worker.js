const staticCashName = "v1";

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(staticCashName);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(staticCashName);
  await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.info('using preload response', preloadResponse);
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  try {
    const responseFromNetwork = await fetch(request);
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCashName)
        .map(key => caches.delete(key)))
    })
  )
});

self.addEventListener('install', event => {
  event.waitUntil(
    addResourcesToCache([
      '/',
      '/index.html',
      '/rss/style.css',
      '/rss/main.js',
      '/icons/android-chrome-192x192.png',
      '/icons/android-chrome-512x512.png',
      '/icons/apple-touch-icon.png',
      '/icons/favicon-16x16.png',
      '/icons/favicon-32x32.png',
      '/icons/favicon.ico',
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: '/index.html',
    })
  );
});