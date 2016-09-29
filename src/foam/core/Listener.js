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

/**
  Listeners are high-level pre-bound event call-backs.
<pre>
  Ex.
  foam.CLASS({
    name: 'Sprinkler',
    listeners: [

      // short-form
      function onAlarm() { ... },

      // long-form
      {
        name: 'onClear',
        isFramed: true,
        code: function() { ... }
      }
    ]
  });
</pre>
  You might use the above onAlarm listener like this:
  alarm.ring.sub(sprinker.onAlarm);
<p>
  Notice, that normally JS methods forget which object they belong
  to so you would need to do something like:
    <pre>alarm.ring.sub(sprinker.onAlarm.bind(sprinkler));</pre>
  But listeners are pre-bound.
*/
// TODO(kgr): Add SUPER support.
foam.CLASS({
  package: 'foam.core',
  name: 'Listener',
  extends: 'foam.core.AbstractMethod',

  properties: [
    { class: 'Boolean', name: 'isFramed',   value: false },
    { class: 'Boolean', name: 'isMerged',   value: false },
    { class: 'Int',     name: 'mergeDelay', value: 16, units: 'ms' }
  ],

  methods: [
    function installInProto(proto) {
      var superAxiom = proto.cls_.getSuperAxiomByName(this.name);

      this.assert(
        ! superAxiom ||
          foam.core.Listener.isInstance(superAxiom),
        'Attempt to override non-listener', this.name);

      var name       = this.name;
      var code       = this.override_(proto, foam.Function.setName(this.code, name));
      var isMerged   = this.isMerged;
      var isFramed   = this.isFramed;
      var mergeDelay = this.mergeDelay;

      Object.defineProperty(proto, name, {
        get: function listenerGetter() {
          if ( this.cls_.prototype === this ) return code;

          if ( ! this.hasOwnPrivate_(name) ) {
            var self = this;
            var l = function(sub) {
              if ( self.isDestroyed() ) {
                if ( sub ) {
                  console.warn('Destroying stale subscription for', self.cls_.id);
                  sub.destroy();
                }
              } else {
                code.apply(self, arguments);
              }
            };

            if ( isMerged ) {
              l = this.__context__.merged(l, mergeDelay);
            } else if ( isFramed ) {
              l = this.__context__.framed(l);
            }
            this.setPrivate_(name, l);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Listener',
      name: 'listeners',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Listener must be named');
          return foam.core.Listener.create({name: o.name, code: o});
        }

        return foam.core.Listener.isInstance(o) ?
            o :
            foam.core.Listener.create(o) ;
      }
    }
  ]
});
