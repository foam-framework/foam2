/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsBasedExportDriver',
  implements: [ 
    'foam.nanos.export.ExportDriver',
    'foam.nanos.export.GoogleSheetsServiceConfig'
  ],
  extends: 'foam.nanos.export.TableExportDriver',

  requires: [
    'foam.nanos.export.GoogleSheetsOutputter'
  ],

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      name: 'outputter',
      hidden: true,
      factory: function() {
        return this.GoogleSheetsOutputter.create();
      },
      flags: ['js']
    }
  ],

  methods: [
    async function exportFObjectAndReturnSheetId(X, obj) {
      var propNames = this.getPropName(X, obj.cls_);
      var objToTable = await this.exportFObjectAndReturnTable(X, obj, propNames);
      var metadata = await this.outputter.getColumnMethadata(X, obj.cls_, propNames);
      return await X.googleSheetsDataExport.createSheet(X, objToTable, metadata, this);
    },
    async function exportDAOAndReturnSheetId(X, dao) {
      var self = this;
      var propNames = this.getPropName(X, dao.of);
      var metadata = await self.outputter.getColumnMethadata(X, dao.of, propNames);
      var stringArray = await this.exportDAOAndReturnTable(X, dao, propNames);
      return await X.googleSheetsDataExport.createSheet(X, stringArray, metadata, this);
    }
  ]
});
