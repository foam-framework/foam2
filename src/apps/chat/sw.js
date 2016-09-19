importScripts('bootFOAMWorker.js');

var env   = foam.apps.chat.Context.create();
var agent = foam.apps.chat.ServiceWorkerAgent.create({ scope: this }, env);
agent.execute();

this.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('v3').then(function(cache) {
      cache.addAll([
        'bootFOAMWeb.js',
        'bootFOAMWorker.js',
        'client.js',
        'foam.js',
        'index.html',
        'sharedWorker.js',
        'style.css'
      ]);
    }));
});

this.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if ( key !== 'v3' ) {
          return caches.delete(key);
        }
      }));
    })
  );
});

this.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request, {
      ignoreSearch: true
    }).then(function(r) {
      if ( ! r ) return fetch(e.request);
      return r;
    }, function() {
      return fetch(e.request);
    }));
});
