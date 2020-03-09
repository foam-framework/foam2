foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportService',
  implements: [
    'foam.nanos.export.GoogleSheetsExport'
  ],
  javaImports: [
    'com.google.api.client.auth.oauth2.Credential',
    'com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp',
    'com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver',
    'com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow',
    'com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets',
    'com.google.api.client.googleapis.javanet.GoogleNetHttpTransport',
    'com.google.api.client.http.javanet.NetHttpTransport',
    'com.google.api.client.json.JsonFactory',
    'com.google.api.client.json.jackson2.JacksonFactory',
    
    'java.io.File',
    'java.io.FileInputStream',
    'java.io.InputStreamReader',
    'java.nio.file.Paths',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.Collections',
    'java.util.List',
    
    'com.google.api.client.util.store.FileDataStoreFactory',
    'com.google.api.services.sheets.v4.Sheets',
    'com.google.api.services.sheets.v4.SheetsScopes',
    'com.google.api.services.sheets.v4.model.*',
    'static com.itextpdf.html2pdf.html.AttributeConstants.APPLICATION_NAME'
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
            private static final List<String> SCOPES = Collections.singletonList(SheetsScopes.DRIVE_FILE);
            private static final String TOKENS_DIRECTORY_PATH = "tokens";
          `
        }));
      }
    }
  ],
  methods: [
    {
      name: 'getCredentials',
      type: 'com.google.api.client.auth.oauth2.Credential',
      javaThrows: [ 'java.io.IOException' ],
      args: [
        {
          name: 'HTTP_TRANSPORT',
          type: 'com.google.api.client.http.javanet.NetHttpTransport'
        }
      ],
      javaCode: `
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(new FileInputStream(System.getProperty("NANOPAY_HOME") + "/credentials.json")));
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                  HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
                  .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(System.getProperty("NANOPAY_HOME"))))
                  .setAccessType("offline")
                  .build();
        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(64342).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
      `
    },
    {
      name: 'createSheet',
      type: 'String',
      args: [
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      javaCode: `
        if( !obj.getClass().isArray())
          return "";

        try {
          List<List<Object>> listOfValues = new ArrayList<>();

          Object[] arr = (Object[]) obj;
          for ( Object v : arr ) {
            listOfValues.add(Arrays.asList((Object[])v));
          }

          final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
          Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
            .setApplicationName(APPLICATION_NAME)
            .build();
    
          Spreadsheet st = new Spreadsheet().setProperties(
            new SpreadsheetProperties().setTitle("My Spreadsheet"));
    
    
          List<ValueRange> data = new ArrayList<>();
          data.add(new ValueRange()
            .setRange("A1")
            .setValues(listOfValues));
    
          BatchUpdateValuesRequest batchBody = new BatchUpdateValuesRequest()
            .setValueInputOption("USER_ENTERED")
            .setData(data);
    
          Spreadsheet response = service.spreadsheets().create(st)
            .execute();
    
          String url = response.getSpreadsheetUrl();
          BatchUpdateValuesResponse batchResult = service.spreadsheets().values()
            .batchUpdate(response.getSpreadsheetId(), batchBody)
            .execute();
    
          System.out.print(url);
          return url;
        } catch(Exception e) {
            System.out.print(e);
            return "";
        }
      `
    }
  ]
});
