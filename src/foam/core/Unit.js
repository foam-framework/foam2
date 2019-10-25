foam.CLASS({
  package: 'foam.core',
  name: 'Unit',
  //abstract: true,

  documentation: `The abstract model for fungible digitized assets`,

  ids: [
    'alphabeticCode'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'name of the asset',
      required: true
    },
    {
      class: 'String',
      name: 'alphabeticCode',
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
