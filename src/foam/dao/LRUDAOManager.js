/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.dao',
  name: 'LRUDAOManager',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Manages a DAO\'s size by removing old items. Commonly applied inside a cache to limit the cache\'s size. Item freshness is tracked in a separate DAO.',

  requires: [ 'foam.dao.MDAO' ],

  classes: [
    {
      /** Links an object id to a last-accessed timestamp */
      name: 'LRUCacheItem',
      properties: [
        {
          name: 'id',
        },
        {
          class: 'Int',
          name: 'timestamp'
        }
      ]
    }
  ],

  properties: [
    {
      /** The maximum size to allow the target dao to be. */
      class: 'Int',
      name: 'maxSize',
      value: 100
    },
    {
      /** Tracks the age of items in the target dao. */
      name: 'trackingDAO',
      factory: function() {
        return this.MDAO.create({ of: this.LRUCacheItem });
      }
    },
    {
      /** The DAO to manage. Items will be removed from this DAO as needed. */
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      /** By starting at the current time, this should always be higher
        than previously stored timestamps. (only relevant if trackingDAO
        is persisted.) */
      class: 'Int',
      name: 'lastTimeUsed_',
      factory: function() { return Date.now(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var proxy = this.dao$proxy;
      proxy.sub('on', 'put',    this.onPut);
      proxy.sub('on', 'remove', this.onRemove);
      proxy.sub('on', 'reset',  this.onReset);
    },

    /** Calculates a timestamp to use in the tracking dao. Override to
      provide a different timestamp calulation. */
    function getTimestamp() {
      // Just increment on each request.
      return this.lastTimeUsed_++;
    },

    function cleanup() {
      var self = this;
      self.trackingDAO
        .orderBy(this.DESC(self.LRUCacheItem.TIMESTAMP))
        .skip(self.maxSize)
        .select({
          put: function(_, obj) {
            self.dao.remove(obj);
          }
        });
    }
  ],

  listeners: [
    /** Adds the put() item to the tracking dao, runs cleanup() to check
      the dao size. */
    function onPut(s, on, put, obj) {
      var self = this;
      this.trackingDAO.put(
        this.LRUCacheItem.create({
          id: obj.id,
          timestamp: self.getTimestamp()
        })
      ).then(function() {
        self.cleanup();
      });
    },

    /** Clears the remove()'d item from the tracking dao. */
    function onRemove(s, on, remove, obj) {
      // ensure tracking DAO is cleaned up
      this.trackingDAO.remove(obj);
    },

    /** On reset, clear the tracking dao. */
    function onReset(s, on, reset, obj) {
      this.trackingDAO.removeAll(obj);
    }
  ]
});
