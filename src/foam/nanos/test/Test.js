/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

FOAM.class({
  package: 'foam.nanos.test',
  name: 'Test',
  extends: 'foam.nanos.script.Script'

  implements: [ 'foam.pattern.EnabledAware' ],

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'DateTime',
      name: 'lastRun'
    },
    {
      class: 'Int',
      name: 'passed'
    },
    {
      class: 'Int',
      name: 'failed'
    },
    {
      class: 'String',
      name: 'notes',
      displayHeight: 20
    },
    {
      class: 'String',
      name: 'code',
      displayHeight: 20
    },
    {
      class: 'String',
      name: 'output',
      visibility: foam.u2.Visibility.RO,
      displayHeight: 20
    }
  ]
});

/*
  {
    class: 'foam.nans.test.Test',
    name: 'Test1',
    code: 'System.out.println("I'm here."); assert(5=5, "Testing equals");'
  }

*/
