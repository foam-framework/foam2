/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleApiAuthService',
  javaImports: [
    'com.google.api.client.auth.oauth2.Credential',
    'com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp',
    'com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver',
    'com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow',
    'com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets',
    'com.google.api.client.http.javanet.NetHttpTransport',
    'com.google.api.client.json.JsonFactory',
    'com.google.api.client.json.jackson2.JacksonFactory',
    'com.google.api.client.util.store.FileDataStoreFactory',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'java.io.FileInputStream',
    'java.io.IOException',
    'java.io.InputStreamReader',
    'java.util.Arrays',
    'java.util.List'
  ],
  constants: [
    {
      name: 'JSON_FACTORY',
      javaType: 'com.google.api.client.json.JsonFactory',
      javaValue: `JacksonFactory.getDefaultInstance();`
    }
  ],
  methods: [
    {
      name: 'getCredentials',
      javaType: 'com.google.api.client.auth.oauth2.Credential',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'HTTP_TRANSPORT',
          javaType: 'com.google.api.client.http.javanet.NetHttpTransport'
        },
        {
          name: 'scopes',
          javaType: 'List<String>'
        }
      ],
      javaThrows: [
        'java.io.IOException'
      ],
      javaCode: `
        GoogleApiCredentials credentialsConfig = (GoogleApiCredentials) ((DAO)getX().get("googleApiCredentialsDAO")).find(((AppConfig)x.get("appConfig")).getUrl());
        if ( credentialsConfig == null )
          return null;
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details()
                .setClientId(credentialsConfig.getClientId())
                .setClientSecret(credentialsConfig.getClientSecret())
                .setAuthUri(credentialsConfig.getAuthUri())
                .setTokenUri(credentialsConfig.getTokenUri())
                .setRedirectUris(Arrays.asList(credentialsConfig.getRedirectUris()));
    
        GoogleClientSecrets clientSecrets = new GoogleClientSecrets().setInstalled(details);
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                  HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, scopes)
                  .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(credentialsConfig.getTokensFolderPath() + "/tokens/")))
                  .build();
        
        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(credentialsConfig.getPort()).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
      `
    }
  ]
});
