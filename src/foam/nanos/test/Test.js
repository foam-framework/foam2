/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'Test',
  extends: 'foam.nanos.script.Script',

  implements: [ 'foam.pattern.EnabledAware' ],

  properties: [
    {
      class: 'Int',
      name: 'passed'
    },
    {
      class: 'Int',
      name: 'failed'
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
