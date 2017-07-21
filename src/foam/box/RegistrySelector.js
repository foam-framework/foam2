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

foam.INTERFACE({
  package: 'foam.box',
  name: 'RegistrySelector',

  documentation: `A function that selects a registry where a service should be
      registered, based on the requested name, service policy, box, and any
      state internal to the selector. RegistrySelectors are used by
      SelectorRegistries to route registration requests.

      NOTE: SelectorRegistry's delegation strategy expects registries returned
      by from RegistrySelectors to reside in a different foam.box.Context (with
      a different foam.box.Context.myname) than the SelectorRegistry.`,

  methods: [
    function select(name, service, box) {}
  ]
});
