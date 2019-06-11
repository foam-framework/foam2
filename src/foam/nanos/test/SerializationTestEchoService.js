foam.CLASS({
  package: 'foam.nanos.test',
  name: 'SerializationTestEchoService',
  documentation: 'A implementation of the EchoService which first serializes then re-parses the object before returning it.  This helps verify that Server to Server serialization works.',
  implements: ['foam.nanos.test.EchoService'],
  methods: [
    {
      name: 'echo',
      javaCode: `
foam.lib.json.PermissionedNetworkOutputter outputter = new foam.lib.json.PermissionedNetworkOutputter(getX());
obj = new foam.lib.json.JSONParser().parseString(outputter.stringify(obj));
return obj;
`
    }
  ]
});
