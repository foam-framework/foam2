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
  name: 'SelectorRegistry',
  extends: 'foam.box.BoxRegistryBox',

  documentation: `A registry that routes registration requests to other
      registries according to its "selector".`,

  requires: [
    'foam.box.NameAlreadyRegisteredException',
    'foam.box.node.ForkBox'
  ],
  exports: [ 'as registry' ],

  classes: [
    {
      name: 'Registration',

      documentation: `Mapping between string key and box registered on dedicated
          worker associated with that key.`,

      properties: [
        {
          class: 'foam.box.BoxRegistry',
          name: 'registry',
          documentation: `The registry that returned "box".`
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'box',
          documentation: `The box returned from registering a service with
              "registry".`
        }
      ]
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.RegistrySelector',
      name: 'selector',
      documentation: `A (potentially stateful) function that selects a delegate
          registry on a per-registration-request basis.`,
      required: true
    },
    {
      class: 'Array',
      // of: 'WorkerRegistration',
      name: 'selectorRegistrations_',
      documentation: `Array of bindings:
          <selector-chosen-delegate, box-returned-from-register-in-delegate>.`
    }
  ],

  methods: [
    {
      name: 'register',
      returns: 'foam.box.Box',
      args: [ 'name', 'service', 'box' ],
      code: function(name, service, box) {
        var delegate = this.selector.select(name, service, box);
        var delegateRegisteredBox = delegate.register(null, null, box);
        this.selectorRegistrations_.push(this.Registration.create({
          registry: delegate,
          box: delegateRegisteredBox
        }));
        return this.SUPER(name, service, delegateRegisteredBox);
      }
    },
    {
      name: 'unregister',
      returns: '',
      code: function(name) {
        // Similar to BoxRegistry implementation, but grab local box for
        // unregistration in worker.
        var delegateRegisteredBox;
        if ( foam.box.Box.isInstance(name) ) {
          for ( var key in this.registry ) {
            if ( this.registry_[key].exportBox === name ) {
              delegateRegisteredBox = this.registry_[key].localBox;
              delete this.registry_[key];
            }
          }
        } else {
          delegateRegisteredBox = this.registry_[name].localBox;
          delete this.registry_[name];
        }

        if ( ! delegateRegisteredBox ) return;

        var registrations = this.selectorRegistrations_;
        var registry = null;
        for ( var i = 0; i < registrations.length; i++ ) {
          if ( registrations[i].box !== delegateRegisteredBox ) continue;
          registry = registrations[i].registry;
          break;
        }

        foam.assert(registry, 'SelectorRegistry: Expected to find registry');

        // TODO(markdittmer): See TODO in BoxRegistry.unregister();
        // unregistering remote boxes this way will not work unless something
        // more nuanced than object identity is used.
        registry.unregister(delegateRegisteredBox);
      }
    }
  ]
});
