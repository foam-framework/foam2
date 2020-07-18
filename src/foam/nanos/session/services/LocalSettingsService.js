foam.INTERFACE({
  package: 'foam.nanos.session.services',
  name: 'LocalSettingsService',
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