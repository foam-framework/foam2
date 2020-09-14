foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'SetCapablePayloadStatusOnPut',

  implements: [
    'foam.nanos.ruler.RuleAction',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Capable capableTarget =
          ((CapableAdapterDAO) x.get("capableObjectDAO")).getCapable();
        
        CapablePayload payload = (CapablePayload) obj;

        if ( payload.getStatus() == ACTION_REQUIRED ) {
          return;
        }

        FObject data = payload.getData();
        if ( data != null ) {
          data.validate(x);
          ucj.setStatus(CapabilityJunctionStatus.PENDING);
        }
      `,
    }
  ]
});