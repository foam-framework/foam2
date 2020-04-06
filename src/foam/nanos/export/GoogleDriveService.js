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
  methods: [
    {
      name: 'deleteFile',
      args: [
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
        Drive service = new Drive.Builder(HTTP_TRANSPORT, JSON_FACTORY,  googleApiAuthService.getCredentials(HTTP_TRANSPORT, SCOPES))
          .setApplicationName("nanopay")
          .build();
    
        service.files().delete(fileId).execute();
      `
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
        private static final List<String> SCOPES = Collections.singletonList(DriveScopes.DRIVE);`);
      }
    }
  ]
});