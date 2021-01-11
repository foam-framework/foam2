/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketServer',

  documentation: `Waits on the socket connection for requests, passing them off to a SocketServerProcessor.`,

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.io.IOException',
    'java.net.ServerSocket',
    'java.net.Socket',
  ],

  constants: [
    {
      name: 'PORT_OFFSET',
      value: 3,
      type: 'Integer'
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'port',
      javaFactory: `
        String portStr = System.getProperty("http.port");
        return Integer.parseInt(portStr) + PORT_OFFSET;
      `
    },
    {
      class: 'String',
      name: 'threadPoolName',
      value: 'threadPool'
    },
    {
      documentation: 'So not to block server shutdown, have sockets timeout. Catch and continue on SocketTimeoutException.',
      class: 'Int',
      name: 'soTimeout',
      value: 60000
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
      name: 'start',
      javaCode: `
        try {
          getLogger().info("Starting,port", getPort());
          ServerSocket serverSocket = new ServerSocket(getPort());

          Agency agency = (Agency) getX().get(getThreadPoolName());
          agency.submit(
            getX(),
            new ContextAgent() {
              @Override
              public void execute(X x) {
                try {
                  while ( true ) {
                    Socket client = serverSocket.accept();
                    client.setSoTimeout(getSoTimeout());
                    agency.submit(
                      x,
                      new SocketServerProcessor(getX(), client),
                      client.getRemoteSocketAddress().toString()
                    );
                  }
                } catch ( IOException ioe ) {
                  getLogger().error(ioe);
                }
              }
            },
            "SocketServer.accept-"+getPort()
          );

        } catch (java.net.BindException e) {
          getLogger().error(e.getMessage(), e);
          System.exit(1);
        } catch ( Exception e ) {
          getLogger().error(e);
        }
      `
    }
  ]
});
