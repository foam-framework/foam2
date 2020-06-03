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
    'foam.nanos.pool.ThreadPoolAgency',
    'foam.core.ContextAgent'
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
      class: 'Object',
      name: 'threadPoolAgency',
      javaFactory:`
        return new ThreadPoolAgency();
      `
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

          ThreadPoolAgency poolAgency = (ThreadPoolAgency) getThreadPoolAgency();
          poolAgency.submit(
            getX(),
            new ContextAgent() {
              @Override
              public void execute(X x) {
                try {
                  Socket client = serverSocket.accept();
                  poolAgency.submit(
                    getX(),
                    new SocketServerProcessor(getX(), client),
                    "socket, processor"
                  );
                } catch ( IOException ioe ) {
                  Logger logger = (Logger) getX().get("logger");
                  if ( logger != null ) logger.error(ioe);
                }
              }
            },
            "Accepting Socket Connection"
          );
        } catch ( Exception e ) {
          Logger logger = (Logger) getX().get("logger");
          if ( logger != null ) logger.error(e);
        }
      `
    }
  ]
})
