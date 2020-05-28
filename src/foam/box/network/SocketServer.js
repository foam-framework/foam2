/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.network',
  name: 'SocketServer',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.core.X',
    'foam.core.ContextAware',
    'foam.nanos.logger.Logger',
    'java.net.ServerSocket',
    'java.net.Socket',
    'java.io.IOException',
  ],

  properties: [
    {
      class: 'Int',
      name: 'port',
      value: 7070
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        try {
          Logger logger = (Logger) getX().get("logger");
          logger.info("Starting TCP Server on port: " + getPort());
          ServerSocket serverSocket = new ServerSocket(getPort());
          (new Thread() {
            @Override
            public void run() {
              try {
                Socket client = serverSocket.accept();
                new SocketServerProcessor(getX(), client).start();
              } catch ( IOException ioe ) {
                Logger logger = (Logger) getX().get("logger");
                if ( logger != null ) logger.error(ioe);
              }
            }
          }).start();
        } catch ( Exception e ) {
          Logger logger = (Logger) getX().get("logger");
          if ( logger != null ) logger.error(e);
        }
      `
    }
  ]
})
