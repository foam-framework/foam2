/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.core',
  name: 'Unit',

  documentation: `The abstract model for fungible digitized assets`,

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of the asset.',
      required: true
    },
    {
      class: 'String',
      name: 'id',
      label: 'Code',
      documentation: 'The id of the Unit',
      required: true
    },
    {
      class: 'Int',
      name: 'precision',
      documentation: 'Defines the number of digits that come after the decimal point. ',
      required: true
    }
  ],
  methods: [
    {
      name: 'asInteger',
      type: 'Long',
      args: [
        { name: 'amount', type: 'Double' }
      ],
      // TODO: warn lossy conversion for decimals-to-precision mismatch
      javaCode: `
        return (long) (Math.floor(amount * Math.pow(10, precision)));
      `,
      code: function(amount) {
        return Math.floor(amount * Math.pow(10, precision));
      }
      //
    },
    {
      name: 'checkExceedsPrecision',
      type: 'Boolean',
      args: [
        { name: 'amount', type: 'Double' }
      ],
      javaCode: `
        long normal = (long) (Math.floor(amount * Math.pow(10, precision)));
        long higher = (long) (Math.floor(amount * Math.pow(10, precision+1)));
        if ( normal*10 == higher ) return false;
        return true;
      `,
      code: function(amount) {
        var normal = Math.floor(amount * Math.pow(10, precision));
        var higher = Math.floor(amount * Math.pow(10, precision+1));
        if ( normal*10 === higher ) return false;
        return true;
      }
    }
  ]
});
