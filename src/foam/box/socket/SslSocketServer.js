/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SslSocketServer',
  documentation: 'TCP server with SSL',

  extends: 'foam.box.socket.SocketServer',

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'javax.net.ssl.*',
    'java.io.FileInputStream',
    'java.io.FileNotFoundException',
    'java.io.IOException',
    'java.io.InputStream',
    'java.security.*',
    'java.security.cert.CertificateException',
    'javax.net.ssl.SSLContext',
    'javax.net.ssl.SSLServerSocket',
    'java.net.Socket'
  ],

  properties: [
    {
      class: 'String',
      name: 'keyStorePath'
    },
    {
      class: 'String',
      name: 'keyStorePass'
    },
    {
      class: 'String',
      name: 'trustStorePath'
    },
    {
      class: 'String',
      name: 'trustStorePass'
    },
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        try {
          getLogger().info("Starting,port", getPort());
          SslContextFactory contextFactory = new SslContextFactory
                                                  .Builder(getX())
                                                  .setKeyStorePath(getKeyStorePath())
                                                  .setKeyStorePass(getKeyStorePass())
                                                  .setTrustStorePath(getTrustStorePath())
                                                  .setTrustStorePass(getTrustStorePass())
                                                  .build();
          SSLServerSocket sslServerSocket = (SSLServerSocket) contextFactory.getSSLContext().getServerSocketFactory().createServerSocket(getPort());
          sslServerSocket.setNeedClientAuth(true);

          Agency agency = (Agency) getX().get(getThreadPoolName());
          agency.submit(
            getX(),
            new ContextAgent() {
              @Override
              public void execute(X x) {
                try {
                  while ( true ) {
                    Socket client = sslServerSocket.accept();
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
})