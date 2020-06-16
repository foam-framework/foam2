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
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.io.IOException',
    'java.net.ServerSocket',
    'java.net.Socket',
  ],

  properties: [
    {
      class: 'Int',
      name: 'port',
      javaFactory: `
        String portStr = System.getProperty("http.port");
        return Integer.parseInt(portStr) + 2;
      `
    },
    {
      class: 'String',
      name: 'threadPoolName',
      value: 'threadPool'
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
          getLogger().info("Starting TCP Server on port", getPort());
          ServerSocket serverSocket = new ServerSocket(getPort());

          Agency agency = (Agency) getX().get(getThreadPoolName());
          agency.submit(
            getX(),
            new ContextAgent() {
              @Override
              public void execute(X x) {
                try {
                  Socket client = serverSocket.accept();
                  agency.submit(
                    x,
                    new SocketServerProcessor(getX(), client),
                    "socket, processor"
                  );
                } catch ( IOException ioe ) {
                  getLogger().error(ioe);
                }
              }
            },
            "Accepting Socket Connection"
          );
        } catch ( Exception e ) {
          getLogger().error(e);
        }
      `
    }
  ]
})
