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

// FObjects with tracing wired up to their pub/sub system.
// Coupling note: Depends on foam.core.tracing.Window refinement
foam.CLASS({
  package: 'foam.core.tracing',
  name: 'FObject',
  refines: 'foam.core.FObject',

  requires: [
    'foam.core.tracing.Notification',
    'foam.core.tracing.Publication'
  ],

  constants: {
    TRACING_PUB_SUB: foam.lookup('foam.core.FObject').create(),
    // TODO(markdittmer): Create axiom for mutable class-level data members.
    STATIC: {
      enabled: true,

      // SUPER implementations from unrefined FObject.
      pub: foam.lookup('foam.core.FObject').prototype.pub,
      notifyListener_: foam.lookup('foam.core.FObject').prototype.
        notifyListener_,
      hasListeners: foam.lookup('foam.core.FObject').prototype.hasListeners
    }
  },

  methods: [
    // Notify tps of publication; push publication as last event; publish event;
    // restore former last event.
    function pub() {
      var rtn;
      var tps = this.TRACING_PUB_SUB;
      var willPublish =
            this.tracingIsEnabled() &&
            // Avoid infinite recursion over tps.
            this !== tps &&
            // Only create Publication if someone is listening.
            this.hasListeners.apply(this, arguments);

      if ( willPublish ) {
        var lastEvent = this.getLastEvent();
        var publication = this.Publication.create({
          publisher: this,
          args: Array.from(arguments)
        });
        tps.pub('publication', publication);
        this.setLastEvent(publication);
      }

      this.STATIC.pub.apply(this, arguments);

      if ( willPublish ) {
        this.setLastEvent(lastEvent);
      }

      return rtn;
    },
    // Notify tps of notification; push publication as last event;
    // publish event; restore former last event.
    function notifyListener_(l, s, a) {
      var tps = this.TRACING_PUB_SUB;
      var willPublish =
            this.tracingIsEnabled() &&
            // Avoid infinite recursion over tps.
            this !== tps &&
            // Only create Notification synchronously if listener is not async.
            ! l.isAsync_;
      if ( willPublish ) {
        var lastEvent = this.getLastEvent();
        var notification = this.Notification.create({
          publisher: this,
          // Rest of data drawn from foam.core.Window's merged() and framed()
          // state object, as well as in-situ function properties added in
          // foam.core.Listener.
          subscriber: l.self ? l.self : null,
          listener: l.code ? l.code : l,
          args: Array.from(a)
        });
        tps.pub('notification', notification);
        this.setLastEvent(notification);
      }

      this.STATIC.notifyListener_.call(this, l, s, a);

      if ( willPublish ) {
        this.setLastEvent(lastEvent);
      }
    },
    function hasListeners() {
      // TRACING_PUB_SUB is an implicit listener for everything except itself.
      // When invoked on itself, fallback on SUPER implementation.
      return this !== this.TRACING_PUB_SUB ||
        this.STATIC.hasListeners.call(this);
    },
    function getLastEvent() {
      return this.getLastEventSlot_().get();
    },
    function setLastEvent(nextLastEvent) {
      return this.getLastEventSlot_().set(nextLastEvent);
    },
    function tracingIsEnabled() {
      return foam.lookup('foam.core.FObject').STATIC.enabled;
    },
    function withoutTracing(f) {
      var state = foam.lookup('foam.core.FObject').STATIC;
      state.enabled = false;
      var rtn = f();
      state.enabled = true;
      return rtn;
    },
    // Prefer properly contextualized lastEvent_ slot. However, objects created
    // before window.core.tracing.Window is installed live in a context
    // that is unaware of the lastEvent_ slot. Since window.core.tracing.Window
    // redefines foam's top-level context (complete with lastEvent_ slot), fallback
    // on this "global" context when necessary.
    function getLastEventSlot_() {
      return (this.__context__.lastEvent_$ || foam.__context__.lastEvent_$);
    }
 ]
});
