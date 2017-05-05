FOAM.class({
  package: 'foam.nanos.test.Test',

  implements: [ 'foam.pattern.EnabledAware' ],

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'DateTime',
      name: 'lastRun'
    },
    {
      class: 'Int',
      name: 'passed'
    },
    {
      class: 'Int',
      name: 'failed'
    },
    {
      class: 'String',
      name: 'notes',
      displayHeight: 20
    },
    {
      class: 'String',
      name: 'code',
      displayHeight: 20
    },
    {
      class: 'String',
      name: 'output',
      visibility: foam.u2.Visibility.RO,
      displayHeight: 20
    }
  ]
});
