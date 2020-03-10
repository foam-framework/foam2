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

          Request fontSizeRequest = new Request().setRepeatCell(new RepeatCellRequest()
            .setCell(new CellData().setUserEnteredFormat(new CellFormat().setTextFormat(new TextFormat().setFontSize(10))))
            .setRange(new GridRange().setEndRowIndex(listOfValues.size() + 1))
            .setFields("userEnteredFormat.textFormat.fontSize"));

          Request fontFamilyRequest = new Request().setRepeatCell(new RepeatCellRequest()
            .setCell(new CellData().setUserEnteredFormat(new CellFormat().setTextFormat(new TextFormat().setFontFamily("Roboto"))))
            .setRange(new GridRange().setEndRowIndex(listOfValues.size() + 1))
            .setFields("userEnteredFormat.textFormat.fontFamily"));

          Request titleBoldRequest = new Request().setRepeatCell(new RepeatCellRequest()
            .setCell(new CellData().setUserEnteredFormat(new CellFormat().setTextFormat(new TextFormat().setBold(true))))
            .setRange(new GridRange().setEndRowIndex(1))
            .setFields("userEnteredFormat.textFormat.bold"));
          
          Request alternatingColors = new Request().setAddBanding(new AddBandingRequest()
            .setBandedRange(new BandedRange().setRange(new GridRange().setEndRowIndex(listOfValues.size()).setEndColumnIndex(listOfValues.get(0).size())).setRowProperties(
              new BandingProperties()
                .setHeaderColor(new Color().setRed(0.643f).setGreen(0.761f).setBlue(0.957f))
                .setFirstBandColor(new Color().setRed(1f).setGreen(1f).setBlue(1f))
                .setSecondBandColor(new Color().setRed(0.91f).setGreen(0.941f).setBlue(0.996f))//232,240,254
            )));

          BatchUpdateSpreadsheetRequest r = new BatchUpdateSpreadsheetRequest().setRequests(new ArrayList(){{
            add(titleBoldRequest);
            add(fontSizeRequest);
            add(fontFamilyRequest);
            add(alternatingColors);
          }});
          BatchUpdateSpreadsheetResponse resp = service.spreadsheets()
            .batchUpdate(response.getSpreadsheetId(), r)
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
