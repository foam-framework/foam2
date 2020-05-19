/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.network',
  name: 'SocketClientBox',

  implements: [
    'foam.box.Box'
  ],

  javaImports: [
  ],

  properties: [
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'Int',
      name: 'port'
    }
  ],

  methods: [
    {
      name: 'send',
      synchronized: true,
      javaCode: `
        ConnectionBox conBox = TCPSocketMgr.instance().get(getX(), getHost(), getPort());
        conBox.send(msg);
      `
    }
  ]

})
