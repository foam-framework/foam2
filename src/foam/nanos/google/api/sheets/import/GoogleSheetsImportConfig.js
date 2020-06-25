foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetsImportConfig',
  documentation: 'GoogleSheetsImportConfig contains info about import',
  properties: [
    {
     // class: 'String',//change to classInfo?
      name: 'importClassInfo',
      class: 'Class',
      javaType: 'foam.core.ClassInfo',
      hidden: true,
    },
    // {
    //   class: 'FObjectArray',
    //   of: 'foam.nanos.google.api.sheets.ColumnPropertyMapping',
    //   name: 'columnToPropertyNameMapping',
    //   documentation: 'not much use for this prop for not nested columns. but nexted columns will contain mapping eg "column: city, property: address.city"'
    // },
    {
      name: 'googleSheetLink',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
      },
      label: 'Google Sheets Link',
      postSet: function() {
        var findMatch = this.googleSheetLink.match(this.SPREADSHEET_ID_REGEX);
       this.googleSpreadsheetId = findMatch ? findMatch[1]: findMatch;
      }
    },
    {
      name: 'cellsRange',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'A1:B2'
      },
      label: 'Table range',
      adapt: function(_, val) {
        if ( val )
          return val.toUpperCase();
        return val;
      }
    },
    {
      name: 'googleSpreadsheetId',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
      },
      label: 'Google Spreadsheet Id',
      hidden: true,
      expression: function(googleSheetLink) {
        var findMatch = googleSheetLink.match(this.SPREADSHEET_ID_REGEX);
        return  findMatch ? findMatch[1] : findMatch;
      }
    },
    {
      name: 'googleSheetId',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
      },
      label: 'Google Sheets Id',
      hidden: true,
      expression: function(googleSheetLink) {
        var findMatch = googleSheetLink.match(this.SHEET_ID_REGEX);
        return  findMatch ? findMatch[1] : findMatch;
      }
    },
    {
      name: 'columnHeaderPropertyMappings',
      class: 'FObjectArray',
      of: 'foam.nanos.google.api.sheets.ColumnHeaderToPropertyName',
      visibility: 'RO'
    }
    // {
    //   name: 'statusUpdateColumn',
    //   class: 'String',
    //   view: {
    //     class: 'foam.u2.TextField',
    //   },
    //   label: 'Column for storing status of data import',
    //   adapt: function(_, val) {
    //     if ( val )
    //       return val.toUpperCase();
    //     return val;
    //   }
    // }
  ],
  constants: {
    //info retrieved from https://developers.google.com/sheets/api/guides/concepts
    SPREADSHEET_ID_REGEX: '/spreadsheets/d/([a-zA-Z0-9-_]+)',
    SHEET_ID_REGEX: '[#&]gid=([0-9]+)'
  },
});

foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ColumnPropertyMapping',
  properties: [
    {
      name: 'columnHeader',
      class: 'String'
    },
    {
      name: 'propertyName',
      class: 'String'
    }
  ]
});