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
  name: 'WorkerRegistry',
  extends: 'foam.box.ProxyBox',
  implements: [ 'foam.box.BoxRegistryBox' ],

  requires: [
    'foam.core.StubFactorySingleton',
    'foam.box.BoxRegistry',
    'foam.box.Context'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.box.Box',
      name: 'delegate',
      documentation: 'Handles requests that are not handled by this registry.',
      required: true
    },
    {
      name: 'localRegistry',
      documentation: 'Handles registration of all workers of this registry.',
      factory: function() {
        // TODO: Creating a context just to get a BoxRegistryBox seems
        // excessive. But, we cannot create a BoxRegistryBox without a context
        // at the moment, so this will suffice for now.
        return foam.box.Context.create().registry;
      }
    },
    {
      class: 'Function',
      name: 'workerFactory',
      documentation: 'Function used to spawn worker instances.',
      value: function(args, ctx) {
        return this.ForkBox.create(args, ctx);
      }
    },
    {
      name: 'stubFactory_',
      documentation: `A factory used to generate BoxRegistryStubs when
        instantiating a dedicated worker.`,
      factory: function() {
        return this.StubFactorySingleton.create().get(this.BoxRegistry);
      }
    },
    {
      name: 'registrationRecord_',
      hidden: true,
      documentation: `Map of the names of registrations.`,
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.validate();
        this.SUPER();
      }
    },
    {
      name: 'register',
      code: function(name, service, box) {
        // Determine if this name has been registered previously.
        if ( this.registrationRecord_[name] )
          throw this.NameAlreadyRegisteredException({ name: name });
      }
    }
  ]
});
