/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CommonPassword',
  
  properties: [
    {
      class: 'String',
      name: 'id'
    }
  ],
  methods: [
    {
      name: 'toString',
      code: function() {
        return this.id;
      }
    }
  ]
})  