foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetsImportConfig',
  documentation: 'GoogleSheetsImportConfig contains info about import',
  properties: [
    {
      name: 'importClassInfo',
      class: 'Class',
      javaType: 'foam.core.ClassInfo',
      hidden: true,
    },
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
      hidden: true
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
      // expression: function(googleSheetLink) {
      //   var findMatch = googleSheetLink.match(this.SHEET_ID_REGEX);
      //   return  findMatch ? findMatch[1] : findMatch;
      // },
      value: 'Sheet1'
    },
    {
      name: 'columnHeaderPropertyMappings',
      class: 'FObjectArray',
      of: 'foam.nanos.google.api.sheets.ColumnHeaderToPropertyMapping',
      visibility: 'RO',
      hidden: true
    }
  ],
  constants: {
    //info retrieved from https://developers.google.com/sheets/api/guides/concepts
    SPREADSHEET_ID_REGEX: '/spreadsheets/d/([a-zA-Z0-9-_]+)',
    // SHEET_ID_REGEX: '[#&]gid=([0-9]+)'//not usefull info unless we want to use gridRange which is probably too much
  },
});