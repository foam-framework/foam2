/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'UnknownFObject',

  implements: [ 'foam.lib.json.OutputJSON' ],

  documentation: 'A FObject for unknown model',

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
    },
    {
      name: 'formatJSON',
      args: [
        {
          name: 'formatter',
          javaType: 'foam.lib.formatter.JSONFObjectFormatter'
        }
      ],
      javaCode: 'formatter.outputJson(getJson());'
    }
  ]
});
