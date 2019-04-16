foam.CLASS({
  package: 'foam.nanos.test',
  name: 'SerializationTestEchoService',
  documentation: 'A implementation of the EchoService which first serializes then re-parses the object before returning it.  This helps verify that Server to Server serialization works.',
  implements: ['foam.nanos.test.EchoService'],
  methods: [
    {
      name: 'echo',
      javaCode: `
foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(foam.lib.json.OutputterMode.NETWORK);
obj = new foam.lib.parse.JSONParser().parseString(outputter.stringify(obj));
return obj;
`
    }
  ]
});
