/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'UnknownFObjectArray',

  implements: [ 'foam.lib.json.OutputJSON' ],

  documentation: 'A FObject for unknown array model',

  properties: [
    {
      class: 'String',
      name: 'json'
    }
  ],

  methods: [
    {
      name: 'outputJSON',
      args: [
        {
          name: 'outputter',
          javaType: 'foam.lib.json.Outputter'
        }
      ],
      javaCode: 'outputter.outputRawString(getJson());'
    }
  ]
});
