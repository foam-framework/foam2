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
  package: 'foam.box',
  name: 'DedicatedWorkerRegistry',
  extends: 'foam.box.BoxRegistryBox', //'foam.box.ProxyBox',
  implements: [ 'foam.box.ProxyBox' ], //'foam.box.BoxRegistryBox' ],

  requires: [
    'foam.core.StubFactorySingleton',
    'foam.box.BoxRegistry',
    'foam.box.node.ForkBox'
  ],

//  imports: [ 'registry' ], // __context__.registry is the context it is declared in

  exports: [ 'as registry' ], // __subContext__.registry === this

  properties: [
    {
      name: "getDedicatedWorkerKey",
      value: function(box) { return null; }
    },
    {
      name: 'workerFactory',
      value: function(ctx) {
        return this.ForkBox.create(null, ctx);
      }
    },
    {
      name: "dedicatedWorkers_",
      factory: function() { return {}; }
    },
    {
      name: 'stubFactory_',
      factory: function() {
        return this.StubFactorySingleton.create().get(this.BoxRegistry);
      }
    }
  ],

  methods: [
    function register(name, service, box) {
      var key = this.getDedicatedWorkerKey(box);
      if ( ! key ) return this.delegate.register(name, service, box);

      // Redirecting all registers of following statements with our registry.
      // If this is not done, this register method will be called recursively,
      // and registrations will be forwarded to delegate.
      var oldReg = this.register;
      this.register = this.SUPER;

      if ( ! this.dedicatedWorkers_[key] )
        this.dedicatedWorkers_[key] = this.stubFactory_.create({
          delegate: this.workerFactory(this)
        }, this);

      var ret = this.dedicatedWorkers_[key].register(name, service, box);

      // Register is set back to this method for future calls.
      this.register = oldReg;
      return ret;
    },
    function unregister(name) {
      // Attempt to unregister in ourselves first.
      if ( foam.box.Box.isInstance(name) ) {
        var key = this.getDedicatedWorkerKey(name);

        for (var key in this.dedicatedWorkers_ ) {
          if ( this.dedicatedWorkers_[key] === name ) {
            delete this.dedicatedWorkers_[key];
            break;
          }
        }
        this.SUPER(name);
        return;
      } else if ( this.dedicatedWorkers_[name] || this.registry[name] ) {
        delete this.dedicatedWorkers_[name];
        this.SUPER(name);
      } else {
        // Forward unregister request to delegate
        this.delegate.unregister(name);
      }
    },
    function send(msg) {
      // Determine if we have a registration for box.
      // If not, forward to delegate and let it handle.
      if ( this.SubBoxMessage.isInstance(msg.object) ) {
        var name = msg.object.name;
        if ( this.registry[name] && this.registry[name].localBox ) {
          this.SUPER(msg);
          return;
        }
      }
      this.delegate.send(msg);
    }
  ]
});
