foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableAdapterDAO',
  extends: 'foam.dao.AbstractDAO',

  javaImports: [
    'java.util.Arrays'
  ],

  documentation: `
    Adapts a Capable object to the DAO interface.
  `,

  properties: [
    {
      name: 'capable',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.lite.Capable'
    },
    // {
    //   name: 'of',
    //   value: 'foam.nanos.crunch.lite.CapablePayloads'
    // }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        CapablePayload payload = (CapablePayload) obj;

        CapablePayload[] payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if (
            payload.getCapability().getId().equals(
              payloads[i].getCapability().getId()
            )
          ) {
            payloads[i] = payload;
            return obj;
          }
        }

        payloads = Arrays.copyOf(payloads, payloads.length + 1);
        payloads[payloads.length - 1] = payload;
        getCapable().setCapablePayloads(payloads);
        return obj;
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return obj; // TODO
      `
    },
    {
      name: 'find_',
      javaCode: `
        return null; // TODO
      `
    },
    {
      name: 'select_',
      javaCode: `
        // TODO
        throw new RuntimeException("TODO");
      `
    }
  ]
});