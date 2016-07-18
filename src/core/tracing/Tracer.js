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

foam.CLASS({
  package: 'foam.core.tracing',
  name: 'Tracer',
  implements: [ 'foam.core.tracing.Untraceable' ],

  requires: [
    // Provides FObject prototype constant, TRACING_PUB_SUB:
    'foam.core.tracing.FObject',
    // DAO for event trees; filters puts DAO according to time-to-live, max
    // event tree depth, and other factors.
    'foam.core.tracing.EventDAO'
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
      value: 0
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
      name: 'dao',
      final: true,
      value: { put: function(event) { event.describe(); } }
    },
    {
      name: 'tps',
      final: true,
      factory: function() { return this.TRACING_PUB_SUB; }
    },
    {
      name: 'enabled',
      value: true,
      postSet: function(old, nu) {
        this.rebind_(old, nu);
      }
    },
    {
      name: 'eventDAO_',
      final: true,
      factory: function() {
        return this.EventDAO.create({
          delegate: this.dao,
          predicate: this.predicate,
          maxDepth: this.maxDepth,
          maxChildren: this.maxChildren,
          maxLifetime: this.maxLifetime,
          cleanupInterval: this.cleanupInterval
        });
      }
    }
  ],

  methods: [
    function enable() { this.enabled = true; },
    function disable() { this.enabled = false; },
    function init() {
      this.SUPER();
      this.rebind_(false, this.enabled);
    },
    function put(event) {
      // TODO(markdittmer): Turn this into an UntraceableDAO decorator.
      return this.withoutTracing( // From foam.core.tracing.FObject.
        this.eventDAO_.put.bind(this.eventDAO_, event))
        // Tracing to DAO is best effort: silence Promise-emitted errors.
        .catch(function() {});
    },
    function rebind_(wasEnabled, isEnabled) {
      if ( wasEnabled === isEnabled || ! this.tps || ! this.predicate ) return;
      // TODO(markdittmer): Support separate predicates for publications and
      // notifications?
      if ( wasEnabled ) {
        if ( this.depth === 0 ) {
          this.tps.unsub('publication', this.predicate, this.onEvent);
          this.tps.unsub('notification', this.predicate, this.onEvent);
        } else {
          this.tps.unsub('publication', this.onEvent);
          this.tps.unsub('notification', this.onEvent);
        }
      }
      if ( isEnabled ) {
        if ( this.depth === 0 ) {
          this.tps.sub('publication', this.predicate, this.onEvent);
          this.tps.sub('notification', this.predicate, this.onEvent);
        } else {
          this.tps.sub('publication', this.onEvent);
          this.tps.sub('notification', this.onEvent);
        }
      }
    }
  ],

  listeners: [
    {
      name: 'onEvent',
      code: function(subscription, topic, event) {
        this.put(event);
      }
    }
  ]
});
