/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.action',
  name: 'ThrowErrorAction',

  documentation: `This Action simply throws an error. It will print the desired text in the property.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    {
      class: 'String',
      name: 'message',
      value: 'ThrowErrorAction, is throwing an error '
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        throw new RuntimeException(getMessage());
      `
    }
  ]
});
