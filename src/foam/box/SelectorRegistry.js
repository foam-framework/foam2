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
      registries according to its "selector".

      NOTE: SelectorRegistry's delegation strategy expects registries returned
      by "selector" to reside in a different foam.box.Context (with a different
      foam.box.Context.myname) than the SelectorRegistry.`,

  requires: [ 'foam.box.Box' ],
  exports: [ 'as registry' ],

  classes: [
    {
      name: 'Registration',

      documentation: `Mapping between a delegate registry and a box returned
          from registering with the delegate.`,

      properties: [
        {
          class: 'String',
          name: 'name',
          documentation: `Name under which registration was stored in
              SelectorRegistry.`
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.BoxRegistry',
          name: 'delegateRegistry',
          documentation: `The registry that SelectorRegistry delegated to for
              managed registration.`
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'delegateRegisteredBox',
          documentation: `Box returned from register() on "delegateRegistry".`
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
      // of: 'Registration',
      name: 'selectorRegistrations_',
      documentation: `Array of bindings:
          <selector-chosen-delegate, box-returned-from-register-in-delegate>.`
    }
  ],

  methods: [
    function register(name, service, box) {
      name = name || foam.next$UID();

      var delegate = this.selector.select(name, service, box);

      var delegateRegisteredBox = delegate.register(null, null, box);

      // Create relay to desired service name, but return box from delegate.
      // This creates a consistent namespace for clients of this registry while
      // also returning NamedBoxes that resolve to delegate Context names.
      this.SUPER(name, service, delegateRegisteredBox);

      this.selectorRegistrations_.push(this.Registration.create({
        name: name,
        delegateRegistry: delegate,
        delegateRegisteredBox: delegateRegisteredBox
      }));

      return delegateRegisteredBox;
    },
    function unregister(nameOrBox) {
      var delegateRegisteredBox;
      var inputIsBox = this.Box.isInstance(nameOrBox);
      if ( inputIsBox ) {
        delegateRegisteredBox = nameOrBox;
      } else {
        delegateRegisteredBox = this.registry_[nameOrBox].localBox;

        // When name is known, delete from this registry immediately.
        this.SUPER(nameOrBox);
      }

      var registrations = this.selectorRegistrations_;
      var delegateRegistry = null;
      for ( var i = 0; i < registrations.length; i++ ) {
        if ( registrations[i].delegateRegisteredBox !== delegateRegisteredBox )
          continue;

        delegateRegistry = registrations[i].delegateRegistry;

        // When name was not previously known, delete from this registry after
        // finding associated Registration.
        if ( inputIsBox ) delete this.registry_[registrations[i].name];
        break;
      }

      foam.assert(delegateRegistry,
                  'SelectorRegistry: Expected to find delegate registry');

      // TODO(markdittmer): See TODO in BoxRegistry.unregister();
      // unregistering remote boxes this way will not work unless something
      // more nuanced than object identity is used.
      delegateRegistry.unregister(delegateRegisteredBox);
    }
  ]
});
