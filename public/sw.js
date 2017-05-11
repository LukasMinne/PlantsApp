var cacheName = 'v2';
var cacheFiles = [
    "./index.html",
    "./html/assortiment.html",
    "./html/route.html",
    "./images/indrijven2.jpg",
    "./images/logoGR_small.png",
    "./assets/css/reset.css",
    "./assets/css/style.css",
    "./assets/jquery-mobile/jquery.mobile-1.4.5.js",
    "./assets/js/jquery-2.1.4.js",
    "./assets/js/script.js",
    "./assets/js/serviceWorkerConfig.js",
    "./assets/media/loods.jpg",
]

self.addEventListener('install', function(e) {
    console.log("[ServiceWorker] Installed")

    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log("[ServiceWorker] Caching cacheFiles");
            return cache.addAll(cacheFiles);
        })
    )

})


self.addEventListener('activate', function(e) {
    console.log("[ServiceWorker] Activated");

    e.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {
                if (thisCacheName !== cacheName) {
                    console.log("[ServiceWorker] Removing Cached Filesfrom ", thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }))
        })
    )
})


self.addEventListener('fetch', function(e) {
    // console.log("[ServiceWorker] Fetching", e.request.url);

    e.respondWith(
        caches.match(e.request).then(function(response) {
            if (response) {
                // console.log("[ServiceWorker] Found in cache", e.request.url);
                return response;
            }

            var requestClone = e.request.clone();

            fetch(requestClone)
                .then(function(response) {
                    if (!response) {
                        // console.log("[ServiceWorker] No response from fetch");
                        return response;
                    }

                    var responseClone = response.clone();
                    caches.open(cacheName).then(function(cache) {
                        cache.put(e.request, responseClone);
                        return response;
                    })
                })
                .catch(function(err) {
                    // console.log("[ServiceWorker] Error Fetching & Caching New Data", err);
                })

        })
    )


})