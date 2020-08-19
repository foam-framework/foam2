foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableObjectData',

  properties: [
    {
      name: 'capablePayloads',
      class: 'FObjectArray',
      // javaType: 'java.util.List<foam.nanos.crunch.crunchlite.CapablePayload>',
      of: 'foam.nanos.crunch.lite.CapablePayload'
    }
  ],
});