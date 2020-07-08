/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketConnectionBoxManager',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.ReplyBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.net.Socket'
  ],

  properties: [
    {
      documentation: 'So not to block server shutdown, have sockets timeout. Catch and continue on SocketTimeoutException.',
      class: 'Int',
      name: 'soTimeout',
      value: 60000
    },
    {
      class: 'Map',
      name: 'boxes',
      javaFactory: `
        return java.util.Collections.synchronizedMap(new java.util.HashMap());
      `
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'add',
      args: [
        {
          name: 'box',
          type: 'SocketConnectionBox'
        }
      ],
      javaCode: `
      getBoxes().put(makeKey(box.getHost(), box.getPort()), box);
      `
    },
    {
      name: 'remove',
      args: [
        {
          name: 'box',
          type: 'SocketConnectionBox'
        }
      ],
      javaCode: `
      getBoxes().remove(makeKey(box.getHost(), box.getPort()));
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
      type: 'foam.box.Box',
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
        SocketConnectionBox box = (SocketConnectionBox) getBoxes().get(makeKey(host, port));
        if ( box != null ) {
          return box;
        }

        try {
          Socket socket = new Socket(host, port);
          socket.setSoTimeout(getSoTimeout());
          box = new SocketConnectionBox(x, socket, host, port);
          Agency agency = (Agency) x.get("threadPool");
          getLogger().debug("agency.submit", "SocketConnectionBox-"+makeKey(host, port));
          agency.submit(x, (ContextAgent) box, "SocketConnectionBox-"+makeKey(host, port));
          add(box);
          return box;
        } catch (java.net.ConnectException e) {
          getLogger().debug(host, port, e.getMessage());
          throw new RuntimeException(e);
        } catch ( Throwable t ) {
          remove(box);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'getReplyBox',
      type: 'foam.box.Box',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'key',
          type: 'String'
        },
      ],
      javaCode: `
      Box box = (Box) getBoxes().get(key);
      if ( box != null ) {
        return box;
      }

      box = new SocketConnectionReplyBox(x, key);
      getBoxes().put(key, box);
      return box;
      `
    },
    {
      name: 'removeReplyBox',
      args: [
        {
          name: 'box',
          type: 'SocketConnectionReplyBox'
        }
      ],
      javaCode: `
      getBoxes().remove(box.getKey());
      `
    },
    {
      name: 'start',
      javaCode: `
        return;
      `
    }
  ]
});

