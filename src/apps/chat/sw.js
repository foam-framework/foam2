importScripts('bootFOAMWorker.js');

var env = foam.apps.chat.Env.create();
var agent = foam.apps.chat.ServiceWorkerAgent.create({ scope: this }, env);
agent.execute();

this.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('v1').then(function(cache) {
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
