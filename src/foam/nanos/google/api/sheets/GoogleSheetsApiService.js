/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetsApiService',
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
    'foam.dao.DAO',
    'foam.mlang.sink.Projection',
    'foam.nanos.column.TableColumnOutputter',
    'foam.nanos.export.GoogleSheetsPropertyMetadata',
    'foam.nanos.google.api.auth.GoogleApiAuthService',
    'foam.nanos.google.api.drive.GoogleDriveService',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',

    'java.io.IOException',
    'java.security.GeneralSecurityException',

    'java.util.*'
  ],
  constants: [
    {
      name: 'JSON_FACTORY',
      javaType: 'com.google.api.client.json.JsonFactory',
      javaValue: `JacksonFactory.getDefaultInstance()`
    },
    {
      name: 'DRIVE_FILE',
      javaType: 'List<String>',
      javaValue: `Collections.singletonList(SheetsScopes.DRIVE_FILE)`
    },
    {
      name: 'READ_AND_EDIT_ALL_SCOPES',
      javaType: 'List<String>',
      javaValue: `Collections.singletonList(SheetsScopes.DRIVE)`
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
      name: 'populateWithDataSheetWithObj',
      javaType: 'String',
      javaThrows: [
        'IOException',
        'GeneralSecurityException'
      ],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'fileId',
          type: 'String'
        },
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'metadata',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
        },
        {
          name: 'extraConfig',
          type: 'Object',
          javaType: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ],
      javaCode: `
        List<List<Object>> listOfValues = new ArrayList<>();
        
        Object[] arr = (Object[]) obj;
        for ( Object v : arr ) {
          listOfValues.add(Arrays.asList((Object[])v));
        }
        
        return populateWithDataSheetWithId(x, fileId, listOfValues, metadata, extraConfig);
      `
    },
    {
      name: 'populateWithDataSheetWithId',
      javaType: 'String',
      javaThrows: [
        'IOException',
        'GeneralSecurityException'
      ],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'fileId',
          type: 'String'
        },
        {
          name: 'listOfValues',
          javaType: 'List<List<Object>>'
        },
        {
          name: 'metadata',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
        },
        {
          name: 'extraConfig',
          type: 'Object',
          javaType: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ],
      javaCode: `
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        GoogleApiAuthService googleApiAuthService = (GoogleApiAuthService)getX().get("googleApiAuthService");
        Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, googleApiAuthService.getCredentials(x, HTTP_TRANSPORT, READ_AND_EDIT_ALL_SCOPES))
          .setApplicationName("nanopay")
          .build();
      
        List<ValueRange> data = new ArrayList<>();
        data.add(new ValueRange()
          .setRange("A1")
          .setValues(listOfValues));
  
        BatchUpdateValuesRequest batchBody = new BatchUpdateValuesRequest()
          .setValueInputOption("USER_ENTERED")
          .setData(data);

        BatchUpdateValuesResponse batchResult = service.spreadsheets().values()
          .batchUpdate(fileId, batchBody)
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
            requests.add(new Request().setUpdateDimensionProperties(new UpdateDimensionPropertiesRequest()
            .setRange(new DimensionRange().setSheetId(0)
            .setDimension("COLUMNS")
            .setStartIndex(i).setEndIndex(i+1))
            .setProperties(new DimensionProperties().setPixelSize(metadata[i].getColumnWidth()))
            .setFields("pixelSize")));

          if ( metadata[i].getCellType().equals("") || metadata[i].getCellType().equals("STRING") || metadata[i].getCellType().equals("ARRAY") || metadata[i].getCellType().equals("ENUM") || metadata[i].getCellType().equals("BOOLEAN") )
            continue;

          RepeatCellRequest req = new RepeatCellRequest().setRange(new GridRange().setStartRowIndex(COLUMN_TITLES_ROW_INDEX).setStartColumnIndex(i).setEndColumnIndex(i+1))
            .setFields(NUMBER_FORMAT);
  
          if ( metadata[i].getPattern().isEmpty() )
            req.setCell(new CellData().setUserEnteredFormat(new CellFormat().setNumberFormat(new NumberFormat().setType(metadata[i].getCellType()))));
          else
            req.setCell(new CellData().setUserEnteredFormat(new CellFormat().setNumberFormat(new NumberFormat().setType(metadata[i].getCellType()).setPattern(metadata[i].getPattern()))));
          requests.add(new Request().setRepeatCell(req));

          if ( metadata[i].getCellType().equals("CURRENCY") ) {
            for ( int j = 0 ; j < metadata[i].getPerValuePatternSpecificValues().length ; j++ ) {
              if ( metadata[i].getPerValuePatternSpecificValues()[j] == null || metadata[i].getPerValuePatternSpecificValues()[j].equals("") || metadata[i].getPerValuePatternSpecificValues()[j].equals(DEFAULT_CURRENCY) )
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
  
        BatchUpdateSpreadsheetRequest r = new BatchUpdateSpreadsheetRequest().setRequests(requests);
  
        BatchUpdateSpreadsheetResponse updateResponse = service.spreadsheets()
          .batchUpdate(fileId, r)
          .execute();
  
        return updateResponse.getSpreadsheetId();
      `
    },
    {
      name: 'createSheetAndPopulateWithData',
      type: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ],
      javaCode: `
        try {
          Object[] metadataArr = (Object[])metadataObj;
          GoogleSheetsPropertyMetadata[] metadata = new GoogleSheetsPropertyMetadata[metadataArr.length];
    
          for ( int i = 0 ; i < metadata.length ; i++ ) {
            metadata[i] = (GoogleSheetsPropertyMetadata)metadataArr[i];
          }

          java.util.List<java.util.List<Object>> data = retrieveTemplateData(x, extraConfig.getExportClsInfo(), extraConfig.getServiceName(), metadata);

          GoogleDriveService googleDriveService = (GoogleDriveService) getX().get("googleDriveService");
          String folderId = googleDriveService.createFolderIfNotExists(x, "Nanopay Export");
          String fileName = extraConfig == null || SafetyUtil.isEmpty(extraConfig.getTitle()) ? ("NanopayExport" + new Date()) : extraConfig.getTitle();
          String fileId = googleDriveService.createFile(x, folderId, fileName);
    
          return populateWithDataSheetWithId(x, fileId, data, metadata, extraConfig);
        } catch ( Throwable t ) {
          Logger l = (Logger) getX().get("logger");
          l.error(t);
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
        } catch ( Throwable t ) {
          Logger l = (Logger) getX().get("logger");
          l.error(t);
        }
      `
    },
    {
      name: 'createSheetByCopyingTemplate',
      javaType: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ],
      javaCode: `
      try {
        Object[] metadataArr = (Object[])metadataObj;
        GoogleSheetsPropertyMetadata[] metadata = new GoogleSheetsPropertyMetadata[metadataArr.length];
  
        for ( int i = 0 ; i < metadata.length ; i++ ) {
          metadata[i] = (GoogleSheetsPropertyMetadata)metadataArr[i];
        }
        java.util.List<java.util.List<Object>> data = retrieveTemplateData(x, extraConfig.getExportClsInfo(), extraConfig.getServiceName(), metadata);

        GoogleDriveService googleDriveService = (GoogleDriveService) getX().get("googleDriveService");
        String folderId = googleDriveService.createFolderIfNotExists(x, "Nanopay Export");
        String fileName = extraConfig == null || SafetyUtil.isEmpty(extraConfig.getTitle()) ? ("NanopayExport" + new Date()) : extraConfig.getTitle();
        String fileId = googleDriveService.createAndCopyFromFile(x, folderId, fileName, extraConfig.getTemplate());
        return populateWithDataSheetWithId(x, fileId, data, metadata, extraConfig);
      } catch ( Throwable t ) {
        Logger l = (Logger) getX().get("logger");
        l.error(t);
        return "";
      }
      `
    },
    {
      name: 'retrieveTemplateData',
      javaType: 'java.util.List<java.util.List<Object>>',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'of',
          class: 'Class',
          javaType: 'foam.core.ClassInfo'
        },
        {
          name: 'daoName',
          class: 'String'
        },
        {
          name: 'metadata',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
        }
      ],
      javaCode: `
        DAO dao = (DAO)x.get(daoName);
        if ( dao == null )
          return null;
        List<String> propertyNames = new ArrayList<String>();
        List<Integer> indexesOfUnitValuePropertyName = new ArrayList<Integer>();
        List<Integer> indexesOfUnitPropertyName = new ArrayList<Integer>();
        for ( int i = 0 ; i < metadata.length ; i++ ) {
          propertyNames.add(metadata[i].getPropName());
          metadata[i].setProjectionIndex(propertyNames.size() - 1);
          if ( metadata[i].getCellType().equals("CURRENCY") ) {
            propertyNames.add(metadata[i].getUnitPropName());
            indexesOfUnitValuePropertyName.add(propertyNames.size() - 2);
            indexesOfUnitPropertyName.add(propertyNames.size() - 1);
          }
        }
        String[] propNamesArr = new String[propertyNames.size()]; 
        for ( int i = 0 ; i < propertyNames.size() ; i++ ) {
          propNamesArr[i] = propertyNames.get(i);
        }
        Projection p = ( new foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder() ).buildProjectionForPropertyNamesArray(x, of, propNamesArr);
        dao.select(p);
        java.util.List<Object[]> values = p.getProjection();
 
        for ( int i = 0 ; i < indexesOfUnitValuePropertyName.size() ; i++ ) {
          int indexOfMetadataPropertyName = indexesOfUnitValuePropertyName.get(i);
          int indexForMetadataPropertyUnitPropertyName = indexesOfUnitPropertyName.get(i);
          String[] patternSpecificValues = new String[values.size()];
          for ( int j = 0 ; j < values.size() ; j++ ) {
            patternSpecificValues[j] = (String) values.get(j)[indexForMetadataPropertyUnitPropertyName];
          }
          metadata[i].setPerValuePatternSpecificValues(patternSpecificValues);
        }
        
        TableColumnOutputter outputter = new TableColumnOutputter();
        return outputter.returnTableForMetadata(x, metadata, values);
      `
    },
    {
      name: 'getFormatedValues',
      type: 'Object',
      javaType: 'ValueRange',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'spreadsheetId',
          type: 'String'
        },
        {
          name: 'range',
          type: 'String'
        }
      ],
      javaThrows: [ 'java.io.IOException', 'java.security.GeneralSecurityException' ],
      javaCode: `
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        GoogleApiAuthService googleApiAuthService = (GoogleApiAuthService)getX().get("googleApiAuthService");
        Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, googleApiAuthService.getCredentials(x, HTTP_TRANSPORT, READ_AND_EDIT_ALL_SCOPES))
          .setApplicationName("nanopay")
          .build();
        Sheets.Spreadsheets.Values.Get request = service.spreadsheets().values()
          .get(spreadsheetId, range)
          .setValueRenderOption("FORMATTED_VALUE")
          .setDateTimeRenderOption("FORMATTED_STRING");

        ValueRange response = request.execute();

        return response;
      `
    },
    {
      name: 'createAndExecuteBatchUpdateWithListOfValuesForCellsRange',
      javaType: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'sheetId',
          javaType: 'String'
        },
        {
          name: 'values',
          javaType: 'List<List<List<Object>>>'
        },
        {
          name: 'cellsRanges',
          javaType: 'List<String>'
        }
      ],
      javaThrows: [ 'java.io.IOException', 'java.security.GeneralSecurityException' ],
      javaCode: `
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        GoogleApiAuthService googleApiAuthService = (GoogleApiAuthService)getX().get("googleApiAuthService");
        Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, googleApiAuthService.getCredentials(x, HTTP_TRANSPORT, READ_AND_EDIT_ALL_SCOPES))
          .setApplicationName("nanopay")
          .build();

        List<ValueRange> data = new ArrayList<>();
        for ( int i = 0 ; i < cellsRanges.size() ; i++ ) {
          data.add(new ValueRange()
            .setRange(cellsRanges.get(i))
            .setValues(values.get(i)));
        }
        
        BatchUpdateValuesRequest batchBody = new BatchUpdateValuesRequest()
          .setValueInputOption("USER_ENTERED")
          .setData(data);
  
        BatchUpdateValuesResponse batchResult = service.spreadsheets().values()
          .batchUpdate(sheetId, batchBody)
          .execute();
        return true;
      `
    },
    {
      name: 'createSheetAndPopulateWithFrontEndData',
      type: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
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
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'Object',
          javaType: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ],
      javaCode: `
        try {
          List<List<Object>> data = new ArrayList<>();
          Object[] metadataArr = (Object[])metadataObj;
    
          GoogleSheetsPropertyMetadata[] metadata = new GoogleSheetsPropertyMetadata[metadataArr.length];
          for ( int i = 0 ; i < metadata.length ; i++ ) {
            metadata[i] = (GoogleSheetsPropertyMetadata)metadataArr[i];
          }
    
          Object[] arr = (Object[]) obj;
          for ( Object v : arr ) {
            data.add(Arrays.asList((Object[])v));
          }

          GoogleDriveService googleDriveService = (GoogleDriveService) getX().get("googleDriveService");
          String folderId = googleDriveService.createFolderIfNotExists(x, "Nanopay Export");
          String fileName = extraConfig == null || SafetyUtil.isEmpty(extraConfig.getTitle()) ? ("NanopayExport" + new Date()) : extraConfig.getTitle();
          String fileId = googleDriveService.createFile(x, folderId, fileName);
    
          return populateWithDataSheetWithId(x, fileId, data, metadata, extraConfig);
        } catch ( Throwable t ) {
          Logger l = (Logger) getX().get("logger");
          l.error(t);
          return "";
        }
      `
    },
    {
      name: 'createSheetByCopyingTemplateAndFronEndData',
      javaType: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
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
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ],
      javaCode: `
      try {
        List<List<Object>> data = new ArrayList<>();
        Object[] metadataArr = (Object[])metadataObj;
        GoogleSheetsPropertyMetadata[] metadata = new GoogleSheetsPropertyMetadata[metadataArr.length];
  
        for ( int i = 0 ; i < metadata.length ; i++ ) {
          metadata[i] = (GoogleSheetsPropertyMetadata)metadataArr[i];
        }
  
        Object[] arr = (Object[]) obj;
        for ( Object v : arr ) {
          data.add(Arrays.asList((Object[])v));
        }

        GoogleDriveService googleDriveService = (GoogleDriveService) getX().get("googleDriveService");
        String folderId = googleDriveService.createFolderIfNotExists(x, "Nanopay Export");
        String fileName = extraConfig == null || SafetyUtil.isEmpty(extraConfig.getTitle()) ? ("NanopayExport" + new Date()) : extraConfig.getTitle();
        String fileId = googleDriveService.createAndCopyFromFile(x, folderId, fileName, extraConfig.getTemplate());
        return populateWithDataSheetWithId(x, fileId, data, metadata, extraConfig);
      } catch ( Throwable t ) {
        Logger l = (Logger) getX().get("logger");
        l.error(t);
        return "";
      }
      `
    },
  ]
});
