
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
  name: 'Runnable',

  documentation: `An asynchronous computation that produces one or more outputs,
      and sends them to its outputBox, reporting any errors to errorBox.`,

  requires: [ 'foam.box.Message' ],

  properties: [
    {
      class: 'String',
      name: 'ioRelationshipType',
      documentation: 'The n:m relationship type of input-to-output.',
      value: '1:1'
    },
    {
      class: 'Class',
      documentation: 'Type of input parameter of run().',
      name: 'inputType',
      factory: function() { return foam.core.FObject; }
    },
    {
      class: 'Class',
      documentation: 'Type of input vaules produced by run().',
      name: 'outputType',
      factory: function() { return foam.core.FObject; }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      documentation: 'Box to send to for computation output(s).',
      name: 'outputBox'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      documentation: 'Box to send to for internal errors(s).',
      name: 'errorBox'
    }
  ],

  methods: [
    {
      name: 'run',
      documentation: 'Modeled computation for outputing to a box.',
      code: function() {}
    },
    {
      name: 'output',
      args: [
        {
          typeName: 'this.outputType',
          documentation: 'Helper function for outputing a value.',
        }
      ],
      code: function(value) {
        this.outputBox.send(this.Message.create({
          object: value
        }));
      }
    },
    {
      name: 'error',
      args: [
        {
          typeName: 'Error',
          documentation: 'Helper function for reporting an error.',
        }
      ],
      code: function(error) {
        this.errorBox.send(this.Message.create({
          object: error
        }));
      }
    }
  ]
});
