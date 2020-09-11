/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.google.api.drive',
  name: 'GoogleDriveService',
  javaImports: [

    'com.google.api.client.googleapis.javanet.GoogleNetHttpTransport',
    'com.google.api.client.http.FileContent',
    'com.google.api.client.http.javanet.NetHttpTransport',
    'com.google.api.client.json.JsonFactory',
    'com.google.api.client.json.jackson2.JacksonFactory',
    'com.google.api.services.drive.Drive',
    'com.google.api.services.drive.DriveScopes',
    'com.google.api.services.drive.model.File',
    'com.google.api.services.drive.model.FileList',

    'foam.nanos.google.api.auth.GoogleApiAuthService',

    'java.io.IOException',
    'java.security.GeneralSecurityException',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.Collections',
    'java.util.List'
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
    },
    {
      name: 'createFolderIfNotExists',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'folderName',
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
        Drive service = new Drive.Builder(HTTP_TRANSPORT, JSON_FACTORY,  googleApiAuthService.addHttpTimeout(googleApiAuthService.getCredentials(x, HTTP_TRANSPORT, SCOPES)))
          .setApplicationName("nanopay")
          .build();
        FileList result = service.files().list()
          .setQ("mimeType = 'application/vnd.google-apps.folder' and name = '" + folderName + "'")
          .setSpaces("drive")
          .execute();
        File file;
        if ( result.getFiles().size() == 0 ) {
          File fileMetadata = new File();
          fileMetadata.setName(folderName);
          fileMetadata.setMimeType("application/vnd.google-apps.folder");
    
          file = service.files().create(fileMetadata)
            .setFields("id")
            .execute();
        } else {
          file = result.getFiles().get(0);
        }
        return file.getId();
      `
    },
    {
      name: 'createFile',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'folderId',
          javaType: 'String'
        },
        {
          name: 'title',
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
        Drive service = new Drive.Builder(HTTP_TRANSPORT, JSON_FACTORY,  googleApiAuthService.addHttpTimeout(googleApiAuthService.getCredentials(x, HTTP_TRANSPORT, SCOPES)))
          .setApplicationName("nanopay")
          .build();
        File fileMetadata = new File();
        fileMetadata.setName(title);
        if ( folderId != null ) {
          fileMetadata.setParents(new ArrayList<String>() {{ add(folderId); }});
        }
        fileMetadata.setMimeType("application/vnd.google-apps.spreadsheet");

        File file = service.files().create(fileMetadata)
          .setFields("id")
          .execute();
        return file.getId();
      `
    },
    {

      name: 'createAndCopyFromFile',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'folderId',
          javaType: 'String'
        },
        {
          name: 'title',
          javaType: 'String'
        },
        {
          name: 'templateId',
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
        File fileMetadata = new File();
        fileMetadata.setName(title);
        if ( folderId != null ) {
          fileMetadata.setParents(new ArrayList<String>() {{ add(folderId); }});
        }

        File file = service.files().copy(templateId, fileMetadata)
          .setFields("id")
          .execute();

        return file.getId();
      `
    }
  ]
});
