/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SslContextFactory',
  documentation: 'create SSL context from resource',
  
  javaImports: [
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
    'foam.nanos.fs.ResourceStorage'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'storeType',
      value: 'PKCS12'
    },
    {
      class: 'String',
      name: 'protocol',
      value: 'SSL'
    },
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
    {
      class: 'FObjectProperty',
      name: 'logger',
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
      name: 'getKeyManagers',
      javaType: 'KeyManager[]',
      args: [
        {
          name: 'storePath',
          type: 'String'
        },
        {
          name: 'storePass',
          type: 'String'
        }
      ],
      javaCode: `
        KeyManager[] keyManagers = null;
        KeyManagerFactory factory = null;
        KeyStore keyStore = null;
        
        try {
          keyStore = getKeystore(storePath, storePass);
          factory = KeyManagerFactory.getInstance("SunX509");
          factory.init(keyStore, storePass == null ? null : storePass.toCharArray());
        } catch ( UnrecoverableKeyException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( KeyStoreException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( NoSuchAlgorithmException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        }
        keyManagers = factory.getKeyManagers();
        return keyManagers;
      `
    },
    {
      name: 'getTrustManagers',
      javaType: 'TrustManager[]',
      args: [
        {
          name: 'storePath',
          type: 'String'
        },
        {
          name: 'storePass',
          type: 'String'
        }
      ],
      javaCode: `
        TrustManager[] trustManagers = null;
        TrustManagerFactory factory = null;
        KeyStore keyStore = null;
        
        try {
          keyStore = getKeystore(storePath, storePass);
          factory = TrustManagerFactory.getInstance("SunX509");
          factory.init(keyStore);
        } catch ( KeyStoreException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( NoSuchAlgorithmException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        }
        trustManagers = factory.getTrustManagers();
        return trustManagers;
      `
    },
    {
      name: 'getKeystore',
      javaType: 'KeyStore',
      args: [
        {
          name: 'storePath',
          type: 'String'
        },
        {
          name: 'storePass',
          type: 'String'
        }
      ],
      javaCode: `
        KeyStore keyStore = null;
        try {
          X resourceStorageX = getX().put(foam.nanos.fs.Storage.class,
            new ResourceStorage(System.getProperty("resource.journals.dir")));
          InputStream is = resourceStorageX.get(foam.nanos.fs.Storage.class).getInputStream(storePath);
          
          keyStore = KeyStore.getInstance(getStoreType());
          keyStore.load(is, storePass == null ? null : storePass.toCharArray());
          is.close();
        } catch ( KeyStoreException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( FileNotFoundException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( NoSuchAlgorithmException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( CertificateException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( IOException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        }
        return keyStore;
      `
    },
    {
      name: 'getSSLContext',
      javaType: 'SSLContext',
      javaCode: `
        SSLContext sslContext = null;
        try {
          sslContext = SSLContext.getInstance(getProtocol());
          sslContext.init(
            getKeyManagers(getKeyStorePath(), getKeyStorePass()),
            getTrustManagers(getTrustStorePath(), getTrustStorePass()),
            null
          );
        } catch ( NoSuchAlgorithmException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        } catch ( KeyManagementException e ) {
          getLogger().error(e);
          throw new RuntimeException(e);
        }
        return sslContext;
      `
    }
  ],
})