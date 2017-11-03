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
  name: 'BroadcastRegistry',
  extends: 'foam.box.BoxRegistryBox',

  requires: [
    'foam.box.Box',
    'foam.box.RoundRobinBox'
  ],
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
              BroadcastRegistry.`
        },
        {
          class: 'Array',
          of: 'String',
          name: 'delegateNames',
          documentation: `Name under which registration delegate services
              are registered.`
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'registeredBox',
          documentation: `Box returned from BroadcastRegistry.register() SUPER()
              implementation.`
        }
      ]
    }
  ],

  properties: [
    {
      class: 'Array',
      of: 'foam.box.BoxRegistryBox',
      name: 'delegates',
      documentation: 'Delegates that recieve register()/unregister() calls.',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.MultiDelegateBox',
      name: 'dispatchBoxPrototype',
      documentation: `Prototype that is clone()d to produce a box that
          encapsulates dispatch to services registered in "delegates".`,
      factory: function() { return this.RoundRobinBox.create(); }
    },
    {
      class: 'Array',
      // of: 'Registration',
      name: 'registrations_',
      documentation: `Array of Registration bindings used to coordinate
          unregister() among self and delegates.`
    }
  ],

  methods: [
    function register(name, service, box) {
      var delegates = this.delegates;
      var dispatchDelegates = new Array(delegates.length);
      var dispatchDelegateNames = new Array(delegates.length);
      for ( var i = 0; i < delegates.length; i++ ) {
        var delegateName = dispatchDelegateNames[i] = foam.uuid.randomGUID();
        dispatchDelegates[i] = delegates[i].register(delegateName, null, box);
      }
      var dispatchBox = this.dispatchBoxPrototype.clone(this);
      dispatchBox.delegates = dispatchDelegates;

      var ret = this.SUPER(name, service, dispatchBox);
      this.registrations_.push(this.Registration.create({
        name: name,
        delegateNames: dispatchDelegateNames,
        registeredBox: ret
      }));

      return ret;
    },
    function unregister(nameOrBox) {
      var registeredBox;
      var inputIsBox = this.Box.isInstance(nameOrBox);
      if ( inputIsBox ) {
        registeredBox = nameOrBox;
      } else {
        registeredBox = this.registry_[nameOrBox].exportBox;
        // When name is known, unregister it.
        this.SUPER(nameOrBox);
      }

      var registration;
      var registrations = this.registrations_;
      for ( var i = 0; i < registrations.length; i++ ) {
        if ( registrations[i].registeredBox !== registeredBox )
          continue;

        // When name was previously unknown, remove from registry_ now that
        // it is known.
        if ( inputIsBox ) delete this.registry_[registrations[i].name];

        registration = registrations[i];
        break;
      }

      foam.assert(registration,
                  'BroadcastRegistry expects to find registration');

      var delegates = this.delegates;
      for ( var i = 0; i < delegates.length; i++ ) {
        delegates[i].unregister(registration.delegateNames[i]);
      }
    }
  ]
});
