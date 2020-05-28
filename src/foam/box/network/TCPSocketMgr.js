/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.network',
  name: 'TCPSocketMgr',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    "java.net.Socket",
    "foam.core.X",
    "foam.nanos.logger.Logger"
  ],

  properties: [
    {
      class: 'Long',
      name: 'timeout',
      value: 5000
    },
    {
      class: 'Map',
      name: 'connectionMap',
      javaFactory: `
        return java.util.Collections.synchronizedMap(new java.util.HashMap());
      `
    }
  ],

  methods: [
    {
      name: 'add',
      args: [
        {
          name: 'con',
          type: 'Object'
        }
      ],
      javaCode: `
        ConnectionBox connectionBox = (ConnectionBox) con;
        getConnectionMap().put(makeKey(connectionBox.getHost(), connectionBox.getPort()), connectionBox);
      `
    },
    {
      name: 'remove',
      args: [
        {
          name: 'con',
          type: 'Object'
        }
      ],
      javaCode: `
        ConnectionBox connectionBox = (ConnectionBox) con;
        getConnectionMap().remove(makeKey(connectionBox.getHost(), connectionBox.getPort()));
      `
    },
    {
      name: 'makeKey',
      type: 'String',
      args: [
        {
          name: 'host',
          type: 'String'
        },
        {
          name: 'port',
          type: 'int'
        }
      ],
      javaCode: `
        return host + ":" + port;
      `
    },
    {
      name: 'get',
      type: 'ConnectionBox',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'host',
          type: 'String'
        },
        {
          name: 'port',
          type: 'int'
        }
      ],
      javaCode: `
        ConnectionBox conBox = (ConnectionBox) getConnectionMap().get(makeKey(host, port));
        if ( conBox != null ) return conBox;

        try {
          Socket socket = new Socket(host, port);
          conBox = new ConnectionBox(getX(), socket, host, port);
          conBox.start();
          return conBox;
        } catch ( Exception e ) {
          Logger logger = (Logger) getX().get("logger");
          if ( logger != null ) logger.error(e);
        }
        return null;
      `
    },
    {
      name: 'start',
      javaCode: `
        return;
      `
    }
  ],

})

