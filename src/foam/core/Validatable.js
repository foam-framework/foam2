/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'Validatable',

  documentation: `
    A model should implement this interface if it is validatable, meaning it is
    possible for some of its property values to be invalid.
  `,

  methods: [
    {
      name: 'validate',
      documentation: `
        This method should check if any of the property values on a model are
        considered invalid and if so throw an IllegalStateException.
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaThrows: ['IllegalStateException'],
    }
  ]
});
