/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.core',
  name: 'Unit',

  documentation: `The abstract model for fungible digitized assets`,

  ids: [
    'id'
  ],

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
      documentation: 'The alphabetic code associated with the asset. Used as an ID.',
      required: true,
      aliases: [
        'id'
      ]
    },
    {
      class: 'Int',
      name: 'precision',
      documentation: 'Defines the number of digits that come after the decimal point. ',
      required: true
    }
  ]
});
