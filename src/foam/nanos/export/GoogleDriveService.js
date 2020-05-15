/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleDriveService',
  javaImports: [
    'com.google.api.client.googleapis.javanet.GoogleNetHttpTransport',
    'com.google.api.client.http.javanet.NetHttpTransport',
    'com.google.api.client.json.JsonFactory',
    'com.google.api.client.json.jackson2.JacksonFactory',
    'com.google.api.services.drive.Drive',
    'com.google.api.services.drive.DriveScopes',

    'java.io.IOException',
    'java.security.GeneralSecurityException',
    'java.util.Collections',
    'java.util.List',
  ],
  constants: [
    {
      name: 'JSON_FACTORY',
      javaType: 'com.google.api.client.json.JsonFactory',
      javaValue: `JacksonFactory.getDefaultInstance()`
    },
    {
      name: 'SCOPES',
      javaType: 'List<String>',
      javaValue: `Collections.singletonList(DriveScopes.DRIVE)`
    }
  ],
  methods: [
    {
      name: 'deleteFile',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'fileId',
          javaType: 'String'
        }
      ],
      javaThrows: [
        'java.io.IOException',
        'java.security.GeneralSecurityException'
      ],
      javaCode: `
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        GoogleApiAuthService googleApiAuthService = (GoogleApiAuthService)getX().get("googleApiAuthService");
        Drive service = new Drive.Builder(HTTP_TRANSPORT, JSON_FACTORY,  googleApiAuthService.getCredentials(x, HTTP_TRANSPORT, SCOPES))
          .setApplicationName("nanopay")
          .build();
    
        service.files().delete(fileId).execute();
      `
    }
  ]
});
