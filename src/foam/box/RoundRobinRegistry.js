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
  name: 'RoundRobinRegistry',
  extends: 'foam.box.BoxRegistryBox',


  requires: [ 'foam.box.RoundRobinBox' ],
  exports: [ 'as registry' ],

  classes: [
    {
      name: 'Registration',

      documentation: `Mapping between registered names and boxes returned
          from registering with the delegates.`,

      properties: [
        {
          class: 'String',
          name: 'name',
          documentation: `Name under which registration was stored in
              RoundRobinRegistry.`
        },
        {
          class: 'FObjectArray',
          of: 'foam.box.Box',
          name: 'roundRobinBox',
          documentation: `RoundRobinBox governing dispatch to registered
              services.`
        }
      ]
    }
  ],

  properties: [
    {
      class: 'Array',
      of: 'foam.box.BoxRegistryBox',
      name: 'delegates'
    },
    {
      class: 'Array',
      // of: 'Registration',
      name: 'registrations_',
      documentation: `Array of Registration bindings.`
    }
  ],

  methods: [
    function register(name, service, box) {
      var delegates = this.delegates;
      var roundRobinDelegates = new Array(delegates.length);
      for ( var i = 0; i < delegates.length; i++ ) {
        roundRobinDelegates[i] = delegates[i].register(null, null, box);
      }
      var roundRobinBox = this.RoundRobinBox.create({
        delegates: roundRobinDelegates
      });

      // Create relay to desired service name, but return box from delegate.
      // This creates a consistent namespace for clients of this registry while
      // also returning NamedBoxes that resolve to delegate Context names.
      this.SUPER(name, service, roundRobinBox);

      this.registrations_.push(this.Registration.create({
        name: name,
        roundRobinBox: roundRobinBox
      }));
    },
    function unregister(nameOrBox) {
      var roundRobinBox;
      var inputIsBox = this.Box.isInstance(nameOrBox);
      if ( inputIsBox ) {
        roundRobinBox = nameOrBox;
      } else {
        roundRobinBox = this.registry_[nameOrBox].localBox;

        // When name is known, delete from this registry immediately.
        this.SUPER(nameOrBox);
      }

      var registeredBoxes;
      var registrations = this.registrations_;
      for ( var i = 0; i < registrations.length; i++ ) {
        if ( registrations[i].roundRobinBox !== roundRobinBox )
          continue;

        registeredBoxes = registrations[i].roundRobinBox.delegates;

        // When name was not previously known, delete from this registry after
        // finding associated Registration.
        if ( inputIsBox ) delete this.registry_[registrations[i].name];
        break;
      }

      foam.assert(registeredBoxes,
                  'RoundRobinRegistry: Expected to find registration');

      // TODO(markdittmer): See TODO in BoxRegistry.unregister();
      // unregistering remote boxes this way will not work unless something
      // more nuanced than object identity is used.
      var delegates = this.delegates;
      for ( var i = 0; i < delegates.length; i++ ) {
        delegates[i].unregister(registeredBoxes[i]);
      }
    }
  ]
});
