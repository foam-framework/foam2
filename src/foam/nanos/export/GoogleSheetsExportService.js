/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportService',
  implements: [
    'foam.nanos.export.GoogleSheetsExport'
  ],
  javaImports: [
    'com.google.api.client.googleapis.javanet.GoogleNetHttpTransport',
    'com.google.api.client.http.javanet.NetHttpTransport',
    'com.google.api.client.json.JsonFactory',
    'com.google.api.client.json.jackson2.JacksonFactory',
    'com.google.api.services.sheets.v4.Sheets',
    'com.google.api.services.sheets.v4.SheetsScopes',
    'com.google.api.services.sheets.v4.model.*',
    'foam.nanos.logger.Logger',

    'java.util.*'
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
      javaValue: `Collections.singletonList(SheetsScopes.DRIVE_FILE)`
    },
    {
      name: 'COLUMN_TITLES_ROW_INDEX',
      javaType: 'int',
      javaValue: `1`
    },
    {
      name: 'NUMBER_FORMAT',
      javaType: 'String',
      javaValue: `"userEnteredFormat.numberFormat"`
    },
    {
      name: 'DEFAULT_CURRENCY',
      javaType: 'String',
      javaValue: `"CAD"`
    }
  ],
  methods: [
    {
      name: 'createSheet',
      javaType: 'String',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'metadataObj',
          javaType: 'Object'
        }
      ],
      javaCode: `
        try {
          List<List<Object>> listOfValues = new ArrayList<>();
          Object[] metadataArr = (Object[])metadataObj;
          GoogleSheetsPropertyMetadata[] metadata = new GoogleSheetsPropertyMetadata[metadataArr.length];
    
          for ( int i = 0 ; i < metadata.length ; i++ ) {
            metadata[i] = (GoogleSheetsPropertyMetadata)metadataArr[i];
          }
    
          Object[] arr = (Object[]) obj;
          for ( Object v : arr ) {
            listOfValues.add(Arrays.asList((Object[])v));
          }
    
          final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
          GoogleApiAuthService googleApiAuthService = (GoogleApiAuthService)getX().get("googleApiAuthService");
          Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, googleApiAuthService.getCredentials(x, HTTP_TRANSPORT, SCOPES))
            .setApplicationName("nanopay")
            .build();
    
          Spreadsheet st = new Spreadsheet().setProperties(
            new SpreadsheetProperties().setTitle("NanopayExport" + new Date()));
    
    
          List<ValueRange> data = new ArrayList<>();
          data.add(new ValueRange()
            .setRange("A1")
            .setValues(listOfValues));
    
          BatchUpdateValuesRequest batchBody = new BatchUpdateValuesRequest()
            .setValueInputOption("USER_ENTERED")
            .setData(data);
    
          Spreadsheet response = service.spreadsheets().create(st)
            .execute();
    
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
            .setRange(new GridRange().setEndRowIndex(COLUMN_TITLES_ROW_INDEX))
            .setFields("userEnteredFormat.textFormat.bold"));
    
          Request alternatingColors = new Request().setAddBanding(new AddBandingRequest()
            .setBandedRange(new BandedRange().setRange(new GridRange().setEndRowIndex(listOfValues.size()).setEndColumnIndex(listOfValues.get(0).size())).setRowProperties(
              new BandingProperties()
                .setHeaderColor(new Color().setRed(0.643f).setGreen(0.761f).setBlue(0.957f))
                .setFirstBandColor(new Color().setRed(1f).setGreen(1f).setBlue(1f))
                .setSecondBandColor(new Color().setRed(0.91f).setGreen(0.941f).setBlue(0.996f))
            )));
    
          List<Request> requests = new ArrayList<Request>(){{
            add(titleBoldRequest);
            add(fontSizeRequest);
            add(fontFamilyRequest);
            add(alternatingColors);
          }};
    
          requests.add(new Request().setAutoResizeDimensions(new AutoResizeDimensionsRequest().setDimensions(new DimensionRange().setSheetId(0).setDimension("COLUMNS").setEndIndex(metadata.length))));
    
          for ( int i = 0 ; i < metadata.length ; i++ ) {
            if ( metadata[i].getColumnWidth() > 0 )
              requests.add(new Request().setUpdateDimensionProperties(new UpdateDimensionPropertiesRequest().setRange(new DimensionRange().setSheetId(0).setDimension("COLUMNS").setStartIndex(i).setEndIndex(i+1)).setProperties(new DimensionProperties().setPixelSize(metadata[i].getColumnWidth())).setFields("pixelSize")));
            if ( metadata[i].getCellType().equals("STRING") )
              continue;
    
            if ( metadata[i].getCellType().equals("DATE_TIME") ) {
              for ( int j = 0 ; j < metadata[i].getPerValuePatternSpecificValues().length ; j++ ) {
                requests.add(new Request().setRepeatCell(
                  new RepeatCellRequest()
                    .setCell(new CellData().setUserEnteredFormat(new CellFormat().setNumberFormat(new NumberFormat().setType(metadata[i].getCellType()).setPattern("ddd mmm d yyyy hh/mm/ss\\" " + metadata[i].getPerValuePatternSpecificValues()[j] + "\\""))))
                    .setRange(new GridRange().setStartColumnIndex(i).setEndColumnIndex(i+1).setStartRowIndex(j+1).setEndRowIndex(j+2))
                    .setFields(NUMBER_FORMAT)
                ));
              }
            } else if ( metadata[i].getCellType().equals("TIME") ) {
              for ( int j = 0 ; j < metadata[i].getPerValuePatternSpecificValues().length ; j++ ) {
                requests.add(new Request().setRepeatCell(
                  new RepeatCellRequest()
                    .setCell(new CellData().setUserEnteredFormat(new CellFormat().setNumberFormat(new NumberFormat().setType(metadata[i].getCellType()).setPattern("hh/mm/ss\\" " + metadata[i].getPerValuePatternSpecificValues()[j] + "\\""))))
                    .setRange(new GridRange().setStartColumnIndex(i).setEndColumnIndex(i+1).setStartRowIndex(j+1).setEndRowIndex(j+2))
                    .setFields(NUMBER_FORMAT)
                ));
              }
            } else {
              if ( metadata[i].getPattern().isEmpty() )
                requests.add(new Request().setRepeatCell(
                  new RepeatCellRequest()
                    .setCell(new CellData().setUserEnteredFormat(new CellFormat().setNumberFormat(new NumberFormat().setType(metadata[i].getCellType()))))
                    .setRange(new GridRange().setStartRowIndex(COLUMN_TITLES_ROW_INDEX).setStartColumnIndex(i).setEndColumnIndex(i+1))
                    .setFields(NUMBER_FORMAT)
                ));
              else
                requests.add(new Request().setRepeatCell(
                  new RepeatCellRequest()
                    .setCell(new CellData().setUserEnteredFormat(new CellFormat().setNumberFormat(new NumberFormat().setType(metadata[i].getCellType()).setPattern(metadata[i].getPattern()))))
                    .setRange(new GridRange().setStartRowIndex(COLUMN_TITLES_ROW_INDEX).setStartColumnIndex(i).setEndColumnIndex(i+1))
                    .setFields(NUMBER_FORMAT)
                ));
    
              if ( metadata[i].getCellType().equals("CURRENCY") ) {
                for ( int j = 0 ; j < metadata[i].getPerValuePatternSpecificValues().length ; j++ ) {
                  if ( metadata[i].getPerValuePatternSpecificValues()[j].equals(DEFAULT_CURRENCY) )
                    continue;
                  requests.add(new Request().setRepeatCell(
                    new RepeatCellRequest()
                      .setCell(new CellData().setUserEnteredFormat(new CellFormat().setNumberFormat(new NumberFormat().setType(metadata[i].getCellType()).setPattern("\\"$\\"#0.00\\" " + metadata[i].getPerValuePatternSpecificValues()[j] + "\\""))))
                      .setRange(new GridRange().setStartColumnIndex(i).setEndColumnIndex(i+1).setStartRowIndex(j+1).setEndRowIndex(j+2))
                      .setFields(NUMBER_FORMAT)
                  ));
                }
              }
            }
          }
    
          BatchUpdateSpreadsheetRequest r = new BatchUpdateSpreadsheetRequest().setRequests(requests);
    
          BatchUpdateSpreadsheetResponse updateResponse = service.spreadsheets()
            .batchUpdate(response.getSpreadsheetId(), r)
            .execute();
    
          return updateResponse.getSpreadsheetId();
        } catch (Exception e) {
          Logger l = (Logger) getX().get("logger");
          l.error(e);
          return "";
        }
      `
    },
    {
      name: 'deleteSheet',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'sheetId',
          javaType: 'String'
        }
      ],
      javaCode: `
        try {
          GoogleDriveService googleDriveService = (GoogleDriveService) getX().get("googleDriveService");
          googleDriveService.deleteFile(x, sheetId);
        } catch(Exception e) {
          Logger l = (Logger) getX().get("logger");
          l.error(e);
        }
      `
    }
  ]
});
