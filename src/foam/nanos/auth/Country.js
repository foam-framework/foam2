/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Country',

  documentation: 'Country information.',

  ids: [ 'code' ],

  properties: [
    {
      class: 'String',
      name: 'code',
      documentation: 'Country code.'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Country name.'
    }
  ],
  methods: [{
    name: 'toString',
    returns: 'String',
    javaReturns: 'String',
    code: function() { return "Country: " + this.code + ", " + this.name; },
    javaCode: `
      return "{ code:" + this.getCode() + ", name:" + this.getName() + " }";
    `
  }]
});
