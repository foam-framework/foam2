/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      postSet: function() {
        var findMatch = this.googleSheetLink.match(this.SPREADSHEET_ID_REGEX);
       this.googleSpreadsheetId = findMatch ? findMatch[1]: findMatch;
      },
      required: true
    },
    {
      name: 'cellsRange',
      class: 'String',
      hidden: true
    },
    {
      name: 'googleSpreadsheetId',
      class: 'String',
      hidden: true,
      expression: function(googleSheetLink) {
        var findMatch = googleSheetLink.match(this.SPREADSHEET_ID_REGEX);
        return  findMatch ? findMatch[1] : findMatch;
      }
    },
    {
      name: 'googleSheetId',
      class: 'String',
      value: 'Sheet1',
      required: true
    },
    {
      name: 'columnHeaderPropertyMappings',
      class: 'FObjectArray',
      of: 'foam.nanos.google.api.sheets.ColumnHeaderToPropertyMapping',
      visibility: 'RO',
      hidden: true
    },
    {
      name: 'DAO',
      class: 'String',
      hidden: true,
    }
  ],
  constants: {
    //info retrieved from https://developers.google.com/sheets/api/guides/concepts
    SPREADSHEET_ID_REGEX: '/spreadsheets/d/([a-zA-Z0-9-_]+)'
  },
});

foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ColumnHeaderToPropertyMapping',
  properties: [
    {
      name: 'of',
      hidden: true
    },
    {
      name: 'columnHeader',
      class: 'String',
      visibility: 'DISABLED',
      validationTextVisible: true,
      validateObj: function() {
        if ( this.prop )
          return;
        return 'Data for column with header  "' + this.columnHeader + '" cannot be imported. You can still import your data but this column data will be ignored';
      }
    },
    {
      name: 'prop',
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      hidden: true,
      javaJSONParser: 'foam.lib.json.ExprParser.instance()',
    },
    {
      name: 'unitProperty',
      class: 'foam.mlang.ExprProperty',
      hidden: true,
      javaJSONParser: 'foam.lib.json.ExprParser.instance()',
    },
    {
      name: 'isUnitValueProperty',
      class: 'Boolean',
      hidden: true,
      documentation: 'set to true if the prop is an instance of Unit Value property'
    }
  ]
});