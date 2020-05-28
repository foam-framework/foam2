/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.network',
  name: 'DemoSocketClientReplyBox',
  implements: [
    'foam.box.Box'
  ],

  javaImports: [
    'foam.lib.json.Outputter',
    'foam.lib.NetworkPropertyPredicate'
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
        System.out.println("---Socket Reply----");
        Outputter outputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate());
        String message = outputter.stringify(msg);
        System.out.println(message);
      `
    }
  ]
})

