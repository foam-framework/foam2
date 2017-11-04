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

foam.CLASS({
  package: 'foam.net.node',
  name: 'CacheHandler',
  extends: 'foam.net.node.BaseHandler',

  documentation: `Handler decorator that caches responses.`,

  requires: [
    'foam.dao.LRUDAOManager',
    'foam.dao.MDAO',
    'foam.net.node.CachedResponse',
    'foam.net.node.CachingResponse'
  ],
  imports: [
    'error',
    'info',
    'requestCacheDAO'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.net.node.Handler',
      name: 'delegate',
      required: true
    }
  ],

  methods: [
    function handle(req, res) {
      var self = this;
      var id = self.CachedResponse.ID_FROM_REQ(req);
      self.requestCacheDAO.find(id).then(function(cachedResponse) {
        if ( cachedResponse ) {
          cachedResponse.replay(res);
          self.info(`CacheHandler: Delegate to cached response: ${id}`);
          return;
        }

        var cachingResponse = self.CachingResponse.create({
          req: req,
          res: res
        });
        cachingResponse.sub('recorded', function(sub, topic, cachedResponse) {
          self.requestCacheDAO.put(cachedResponse).then(function() {
            self.info(`CacheHandler: Cached new response: ${id}`);
          });
          self.info(`CacheHandler: Cache new response: ${id}`);
        });
        self.delegate.handle(req, cachingResponse);
        self.info(`CacheHandler: Record new response: ${id}`);
      }).catch(function(error) {
        self.send500(req, res, error);
        self.error(`CacheHandler: Error on requestCacheDAO.find(${id})`);
      });

      return true;
    }
  ]
});
