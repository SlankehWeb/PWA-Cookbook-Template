const staticCacheName = 'site-static-v3'
const dynamicCacheName = 'site-dynamic-v1'

const assets = [
	'/',
	'./index.html',
	'./js/app.js',
	'./js/ui.js',
	'./js/materialize.min.js',
	'./css/styles.css',
	'./css/materialize.min.css',
	'./img/dish.png',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
	'/pages/fallback.html'
]

/**
 * Funktion 
 * @param {String} cacheName cache navn
 * @param {Number} numAllowedFiles tilladte filer
 */
const limitCacheSize = (cacheName, numAllowedFiles) => {
	caches.open(cacheName).then(cache => {
		cache.keys().then(keys => {
			if(keys.length > numAllowedFiles) {
				cache.delete(keys[0]).then(
					limitCacheSize(cacheName, numAllowedFiles)
				)
			}
		})
	})
}


self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(staticCacheName).then(cache => {
			cache.addAll(assets)
		})	
	)
})

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(keys
				.filter(key => key !== staticCacheName)
				.map(key => caches.delete(key)))
		})
	)
	return;
})


self.addEventListener('fetch', event => {
	limitCacheSize(dynamicCacheName, 2)


	if(!(event.request.url.indexOf('http') === 0)) return;
	event.respondWith(
		caches.match(event.request).then(cacheRes => {
			return cacheRes || fetch(event.request).then(fetchRes => {
				return caches.open(dynamicCacheName).then(cache => {
					cache.put(event.request.url, fetchRes.clone())
					limitCacheSize(dynamicCacheName, 2)
					return fetchRes
				})
			})


		}).catch(()=>caches.match('/pages/fallback.html'))
	)
})


