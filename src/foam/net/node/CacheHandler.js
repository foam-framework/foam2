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
  flags: ['node'],
  documentation: `Handler decorator that caches responses.`,

  requires: [
    'foam.dao.LRUDAOManager',
    'foam.dao.MDAO',
    'foam.net.node.CachedResponse',
    'foam.net.node.CachingResponse',
    'foam.net.node.RequestIdentifier'
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
    },
    {
      class: 'FObjectProperty',
      of: 'foam.net.node.RequestIdentifier',
      name: 'requestIdentifier',
      factory: function() { return this.RequestIdentifier.create(); },
    },
  ],

  methods: [
    function handle(req, res) {
      var self = this;

      this.requestIdentifier.getId(req).then(function(id) {
        return self.requestCacheDAO.find(id).then(function(cachedResponse) {
          if ( cachedResponse ) {
            cachedResponse.replay(res);
            self.info(`CacheHandler: Delegate to cached response: ${id}`);
            return;
          }

          var cachingResponse = self.CachingResponse.create({
            id: id,
            req: req,
            res: res
          });
          var recordedSub = cachingResponse.sub(
              'recorded', function(sub, topic, cachedResponse) {
                self.requestCacheDAO.put(cachedResponse).then(function() {
                  self.info(`CacheHandler: Cached new response: ${id}`);
                });
                self.info(`CacheHandler: Cache new response: ${id}`);
              });
          var handled = self.delegate.handle(req, cachingResponse);

          if ( ! handled ) {
            recordedSub.detach();
            self.send500(req, res, 'Failed to handle request');
            self.error(`CacheHandler: Delegate failed to handle request: ${id}`);
            return;
          }

          self.info(`CacheHandler: Record new response: ${id}`);
        }).catch(function(error) {
          self.send500(req, res, error);
          self.error(`CacheHandler: Error on requestCacheDAO.find(${id}):
                         ${error}`);
        });
      }).catch(function(error) {
        self.send500(req, res, error);
        self.error(`CacheHandler: Error on requestIdentifier.getId():
                       ${error}`);
      });

      return true;
    }
  ]
});
