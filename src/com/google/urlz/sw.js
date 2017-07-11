/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

(function() {
  self.window = self.global = self;
  self.FOAM_BOOT_PATH = '../../../';
  importScripts('../../../foam.js');

  var version = foam.util.hashCode(arguments.callee.toString());

  self.addEventListener('install', function(event) {
    console.log('ServiceWorker', version, 'installed');
  });
  self.addEventListener('activate', function(event) {
    console.log('ServiceWorker', version, 'activated');
  });
  self.addEventListener('fetch', function(event) {
    console.log('ServiceWorker', version, 'fetch', event.request);
    event.respondWith(fetch(event.request));
  });
})();
