/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportDriver',
  extends: 'foam.nanos.export.GoogleSheetsBasedExportDriver',

  documentation: `
    Driver retrieves data, transforms it and makes calls to googleSheetsDataExport.
    googleSheetsDataExport retrieves permission from a user to make calls to Google Sheets API on their behalf,
    creates Google Sheet, sends data to api and returns sheet id which is used for returning link to user.
  `,

  methods: [
    async function exportFObject(X, obj) {      
      var sheetId  = await this.exportFObjectAndReturnSheetId(X, obj);
      
      if ( ! sheetId || sheetId.length === 0)
        return '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    },
    async function exportDAO(X, dao) {
      var sheetId  = await this.exportDAOAndReturnSheetId(X, dao);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    }
  ]
});