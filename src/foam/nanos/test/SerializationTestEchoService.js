/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'SerializationTestEchoService',
  documentation: 'A implementation of the EchoService which first serializes then re-parses the object before returning it.  This helps verify that Server to Server serialization works.',
  implements: ['foam.nanos.test.EchoService'],
  methods: [
    {
      name: 'echo',
      javaCode: `
foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(getX()).setPropertyPredicate(new foam.lib.AndPropertyPredicate(getX(), new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
obj = new foam.lib.json.JSONParser().parseString(outputter.stringify(obj));
return obj;
`
    }
  ]
});
