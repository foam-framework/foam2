/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
   package: 'foam.nanos.dig',
   name: 'Format',

   documentation: 'CRUD controller modes: CREATE/VIEW/EDIT.',

   values: [
     { name: 'JSON', label: 'JSON' },
     { name: 'XML',  label: 'XML'  }
   ]
 });


foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUG',

  searchColumns: [],

  properties: [
    { class: 'String', name: 'id' },
    { class: 'String', name: 'daoKey' },
    { class: 'String', name: 'url' },
    { class: 'Enum', of: 'foam.nanos.dig.Format', name: 'format' },
    { class: 'Reference', of: 'foam.nanos.auth.User', name: 'owner' }
  ],

  methods: [
    {
      name: 'execute',
      args: [ { name: 'x', javaType: 'X'} ],
      javaReturns: 'void',
      javaCode: `
        System.out.println("Executing" + this.getId());
      `
    }
  ]
});
