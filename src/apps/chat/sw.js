/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
