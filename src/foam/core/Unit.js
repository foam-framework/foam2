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
  ]
});
