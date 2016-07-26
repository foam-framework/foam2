/*
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

// Custom DAO for manageable retention of tracing events.
foam.CLASS({
  package: 'foam.core.tracing',
  name: 'EventDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.core.tracing.Untraceable' ],

  requires: [
    'foam.dao.MDAO',
    'foam.core.tracing.EventNode',
    'foam.mlang.Expressions'
  ],
  imports: [
    'clearInterval',
    'setInterval'
  ],

  properties: [
    {
      name: 'predicate',
      final: true,
      factory: function() {
        return foam.lookup('foam.mlang.predicate.True').create();
      }
    },
    {
      name: 'maxDepth',
      final: true,
      value: 0
    },
    {
      name: 'maxChildren',
      final: true,
      value: -1
    },
    {
      name: 'maxLifetime',
      final: true,
      value: -1
    },
    {
      name: 'cleanupInterval',
      final: true,
      value: 10000
    },
    {
      name: 'intervalId_',
      value: 0
    },
    {
      name: 'eventDAO_',
      factory: function() {
        return this.MDAO.create({
          of: this.EventNode
        });
      }
    },
    {
      name: 'recordCount_',
      value: 0
    }
  ],

  methods: [
    /**
     * Put data retained and passed to delegate iff either:
     * (1)  Event matches 'predicate'
     * or
     * (2)  Event descends from a known event
     *      and
     * (2a) Tree size constraints are met (see 'parentFound')
     */
    function put(event) {
      if ( this.predicate.f(event) ) {
        this.putEvent(this.EventNode.create({
          id: event.id,
          timestamp: this.getTime(),
          depth: this.maxDepth,
          event: event
        }));
        // TODO(markdittmer): Promise.resolve() below deals with ad-hoc delegate
        // DAOs that do not honour Promise contract.
        return this.delegate.put(event) || Promise.resolve(event);
      }

      if ( ! event.parent ) {
        // TODO(markdittmer): Error should be modeled.
        return Promise.reject('EventDAO: Event neither matches predicate nor ' +
                              'descends from another event');
      }

      return this.eventDAO_.find(event.parent.id).then(
        this.parentFound.bind(this, event),
        this.onParentError);
    },
    function getTime() {
      return performance.now();
    },
    function putEvent(eventNode) {
      // Kick-off housekeeping when going from empty DAO to non-empty DAO.
      if ( this.recordCount_ === 0 && this.maxLifetime >= 0 ) {
        this.intervalId_ = this.setInterval(this.onCleanup,
                                            this.cleanupInterval);
      }
      this.recordCount_++;
      return this.eventDAO_.put(eventNode);
    },
    function removeEvent(id) {
      this.recordCount_--;
      // Don't need to perform housekeeping on an empty DAO.
      if ( this.recordCount_ === 0 && this.maxLifetime >= 0 ) {
        this.clearInterval(this.intervalId_);
        this.intervalId_ = 0;
      }
      return this.eventDAO_.remove(id);
    },
    /**
     * Callback when parent event is found in 'eventDAO_'.
     * Next steps here are:
     * (1) Reject events when tree size constraints are not met (early exit),
     * (2) Retain event with parent pointer,
     * (3) Pass event to delegate.
     */
    function parentFound(event, eventNode) {
      if ( ! eventNode.depth || eventNode.numChildren === this.maxChildren ) {
        return Promise.reject('EventDAO: Tree size constraint exceeded');
      }

      eventNode.numChildren++;
      var self = this;
      return this.putEvent(eventNode).then(function() {
        return self.putEvent(self.EventNode.create({
          id: event.id,
          timestamp: self.getTime(),
          depth: eventNode.depth - 1,
          event: event
        }));
      }).then(function() {
        return self.delegate.put(event);
      });
    }
  ],

  listeners: [
    /**
     * Handle error on attempt to find parent event.
     */
    {
      name: 'onParentError',
      code: function() {
        // TODO(markdittmer): Error should be modeled.
        return Promise.reject('EventDAO: Event neither matches predicate nor ' +
                              'descends from a traced event');
      }
    },
    /**
     * Perform housekeeping associated with event 'maxLifetime'.
     */
    {
      name: 'onCleanup',
      code: function() {
        var M = this.Expressions.create();
        var cutoff = this.getTime() - this.maxLifetime;
        var expiredEvents = [];
        var dao = this.eventDAO_;
        dao.where(M.LT(this.EventNode.TIMESTAMP, cutoff)).select({
          put: function(eventNode) { expiredEvents.push(eventNode); }
        }).then(function() {
          for ( var i = 0; i < expiredEvents.length; i++ ) {
            dao.remove(expiredEvents[i].id);
          }
        });
      }
    },
  ]
});
