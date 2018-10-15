/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.todojs',
  name: 'Todo',

  properties: [
    {
      class: 'Int',
      name: 'id',
    },
    {
      class: 'String',
      name: 'action',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
    {
      class: 'Boolean',
      name: 'done',
      view: {
        class: 'foam.u2.CheckBox'
      }
    }
  ]
});
