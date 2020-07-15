foam.INTERFACE({
  package: 'foam.nanos.session.services',
  name: 'HomeDenominationSessionService',
  methods: [
    {
      name: 'addHomeDenomination',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'homeDenomination',
          type: 'String'
        }
      ]
    }
  ]
});