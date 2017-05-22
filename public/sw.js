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
        caches.match(e.request)
        .then(function(response) {

            if (response)
                var cacheResponse = response.clone();

            var fetchRequest = e.request.clone();

            // try fetching request
            return fetch(fetchRequest)
                .then(function(response) {

                    if (!response) {
                        console.log("[Serviceworker] fetch unsuccesfull using cache");

                        return cacheResponse;
                    }
                    console.log("[Serviceworker] fetch succesfull");

                    var responseToCache = response.clone();

                    console.log("[Serviceworker] Updating cache with new fetch");
                    caches.open(cacheName)
                        .then(function(cache) {
                            // update cache
                            cache.put(e.request, responseToCache);

                            console.log("[Serviceworker] Cache updated");
                        });

                    return response;

                })
                .catch(function(err) {
                    console.log("[Serviceworker] Error fetching returning cache ", err);

                    return cacheResponse;
                });
        })
    )
});