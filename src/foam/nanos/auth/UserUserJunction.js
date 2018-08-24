foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserUserJunction',

  documentation: `A junction between two User models. Used in relationships.`,

  ids: ['sourceId', 'targetId'],

  properties: [
    {
      class: 'Reference',
      name: 'sourceId',
      shortName: 's',
      of: foam.nanos.auth.User,
    },
    {
      class: 'Reference',
      name: 'targetId',
      shortName: 't',
      of: foam.nanos.auth.User
    }
  ]
});
