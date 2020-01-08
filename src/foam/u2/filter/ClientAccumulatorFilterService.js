foam.CLASS({
  package: 'foam.u2.filter',
  name: 'ClientAccumulatorFilterService',

  implements: [
    'foam.u2.filter.AccumulatorFilter'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.u2.filter.AccumulatorFilter',
      name: 'delegate'
    }
  ]
});
