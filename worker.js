const ctype     = 'Content-Type';
const cacheName = 'onlypass_cache_v3';
const cacheUrls = [
    "/onlypass/",
    "/onlypass/manifest.json",
    "/onlypass/index.html",
    "/onlypass/bundle.js",
    "/onlypass/assets/icon.svg",
    "/onlypass/assets/icon.png",
    "/onlypass/vendor/css/destyle.min.css",
    "/onlypass/vendor/js/sha3.js",
];
const mimes     = {
    js   : 'text/javascript',
    html : 'text/html',
    css  : 'text/css',
    jpg  : 'image/jpeg',
    png  : 'image/png',
    svg  : 'image/svg+xml',
    json : 'application/json',
};
const store     = {};
const wait      = () => new Promise(r => setTimeout(() => r(true), 10));
const getpage   = async event => {
	let path   = new URL(event.request.url).pathname;
	let mime   = mimes[path.split('.').pop()] || mimes.html;
	let count  = 0;
	let ch     = new BroadcastChannel('onlypass_channel');
	let page;
	
	void ch.addEventListener('message', event => {
		try {
			void Object.assign(store, JSON.parse(event.data));
		}
		catch {}
	});
	void ch.postMessage({load: true});
	
	while (++count < 200 && await wait()) {
		if (path in store) {
			page = store[path];
			break;
		}
	}

	return {page, mime};
};



void self.addEventListener('activate', async event => void self.clients.claim());
void self.addEventListener("install",  async event => {
	const content = await Promise.all(cacheUrls.map(url => fetch(url).then(r => r.text())));
	const channel = new BroadcastChannel('onlypass_channel');

	void cacheUrls.forEach((url, index) => {
		void channel.postMessage({save: true, url, data: content[index]});
	});
});
void self.addEventListener("fetch",    async event => void event
	.respondWith(getpage(event)
		.then(data => new Response(data.page, {
			headers: { [ctype]: data.mime }
		}))
));








