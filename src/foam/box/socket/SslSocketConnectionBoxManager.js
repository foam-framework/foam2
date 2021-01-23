/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SslSocketConnectionBoxManager',
  documentation: 'TCP client manager with SSL',
  
  extends: 'foam.box.socket.SocketConnectionBoxManager',
  
  javaImports: [
    'foam.box.Box',
    'foam.box.ReplyBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'javax.net.ssl.SSLSocket',
    'javax.net.ssl.SSLSocketFactory',
    'java.net.InetSocketAddress',
    'java.io.*',
    'javax.net.ssl.SSLContext',
    'javax.net.ssl.SSLSocket'
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
      name: 'get',
      synchronized: true,
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
        String key = makeKey(host, port);
        SocketConnectionBox box = (SocketConnectionBox) getBoxes().get(key);
        if ( box != null ) {
          return box;
        }

        try {
          SslContextFactory contextFactory = new SslContextFactory
                                                  .Builder(x)
                                                  .setKeyStorePath(getKeyStorePath())
                                                  .setKeyStorePass(getKeyStorePass())
                                                  .setTrustStorePath(getTrustStorePath())
                                                  .setTrustStorePass(getTrustStorePass())
                                                  .build();
  
          SSLContext sslContext = contextFactory.getSSLContext();
          SSLSocket sslSocket = (SSLSocket)sslContext.getSocketFactory().createSocket(host, port);

          // Register socket into box.
          box = new SocketConnectionBox(x, key, sslSocket, host, port);
          add(box);
          Agency agency = (Agency) x.get("threadPool");
          agency.submit(x, (ContextAgent) box, sslSocket.getRemoteSocketAddress().toString());
          return box;
        } catch ( IOException e ) {
          remove(box);
          getLogger().error(host, port, e.getClass().getSimpleName(), e.getMessage());
          throw new RuntimeException(e);
        } catch ( Throwable t ) {
          remove(box);
          getLogger().warning(host, port, t.getClass().getSimpleName(), t.getMessage());
          throw new RuntimeException(t);
        }
      `
    },
  ]
})