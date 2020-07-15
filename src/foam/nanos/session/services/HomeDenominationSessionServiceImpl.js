foam.CLASS({
  package: 'foam.nanos.session.services',
  name: 'HomeDenominationSessionServiceImpl',
  implements: [
    'foam.nanos.session.services.HomeDenominationSessionService'
  ],
  javaImports: [
    'foam.nanos.session.Session'
  ],
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
        },
      ],
      javaCode: `
        if ( homeDenomination == null || homeDenomination.length() == 0 )
          homeDenomination = "USD";
        Session session = x.get(Session.class);
        session.setHomeDenomination(homeDenomination);
      `
    }
  ]
});