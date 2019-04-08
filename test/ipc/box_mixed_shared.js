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
  package: 'foam.box.test',
  name: 'ServiceA',

  methods: [
    {
      name: 'report',
      async: true,
      type: 'Integer',
      code: function() { return Promise.resolve(require('process').pid); }
    }
  ]
});

foam.CLASS({
  package: 'foam.box.test',
  name: 'ServiceB',

  methods: [
    {
      name: 'report',
      async: true,
      type: 'Integer',
      code: function() { return Promise.resolve(require('process').pid); }
    }
  ]
});

foam.CLASS({
  package: 'foam.box.test',
  name: 'WorkerService',

  methods: [
    {
      name: 'report',
      async: true,
      type: 'Integer',
      code: function() { return Promise.resolve(require('process').pid); }
    }
  ]
});

foam.CLASS({
  package: 'foam.box.test',
  name: 'SkeletonClassRegistrySelector',
  implements: [ 'foam.box.RegistrySelector' ],

  properties: [
    {
      class: 'Class',
      name: 'cls',
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.BoxRegistry',
      name: 'clsRegistry',
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.BoxRegistry',
      name: 'delegate',
      required: true
    }
  ],

  methods: [
    function select(name, service, box) {
      debugger;
      this.validate();
      return this.cls.isInstance(box.data) ? this.clsRegistry : this.delegate;
    }
  ]
});
