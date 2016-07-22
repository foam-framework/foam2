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

// Override some bits of foam.core.Window to support more accurate tracing.
foam.CLASS({
  package: 'foam.core.tracing',
  name: 'Window',
  extends: 'foam.core.Window',

  requires: [
    'FObject',
    'foam.core.tracing.Notification'
  ],
  exports: [ 'lastEvent_' ],

  properties: [
    {
      name: 'lastEvent_',
      value: null
    }
  ],

  methods: [
    function getAsyncListener_(state) {
      var ctx = this;
      var baseListener = this.SUPER(state);
      return function asyncListener() {
        var tps = ctx.FObject.TRACING_PUB_SUB;
        // Publish notification now, during async callback.
        if ( tps ) {
          tps.pub('notification', ctx.Notification.create({
            // Grab publisher from Publication stored before async callback.
            // Note: Some notifications are simply listener callbacks, and may
            // have no lastEvent.
            publisher: state.lastEvent ? state.lastEvent.publisher : null,
            // Rest of data drawn from foam.core.Window's merged() and framed()
            // state object, as well as in-situ function properties added in
            // foam.core.Listener.
            subscriber: state.l.self ? state.l.self : null,
            listener: state.l.code ? state.l.code : state.l,
            args: Array.from(state.lastArgs)
          }));
        }

        ctx.lastEvent_ = state.lastEvent;

        return baseListener.apply(this, arguments);
      };
    },
    function getFramedListener_(state, frameFired) {
      var ctx = this;
      var framed = function framed() {
        state.lastEvent = ctx.lastEvent_;
        state.lastArgs = arguments;

        if ( ! state.triggered ) {
          state.triggered = true;
          ctx.requestAnimationFrame(frameFired);
        }
      };

      // Store indicator of async for foam.core.tracing.FObject refinement,
      // which uses this information to decide whether to publish notifications
      // immediately.
      framed.isAsync_ = true;

      return framed;
    },

    // Never publish event state changes. This re-implements
    // foam.core.tracing.Untraceable, but since this is a refinement, it cannot
    // extend anything.
    function hasListeners() { return false; },
    function pubPropertyChange_() {}
  ]
});

foam.__context__ = foam.lookup('foam.core.tracing.Window').create({
  window: global
}, foam.__context__).__subContext__;
