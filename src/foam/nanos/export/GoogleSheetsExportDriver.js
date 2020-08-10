/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportDriver',
  implements: [ 
    'foam.nanos.export.ExportDriver',
    'foam.nanos.export.GoogleSheetsServiceConfig'
  ],

  documentation: `
    Driver retrieves data, transforms it and makes calls to googleSheetsDataExport.
    googleSheetsDataExport retrieves permission from a user to make calls to Google Sheets API on their behalf,
    creates Google Sheet, sends data to api and returns sheet id which is used for returning link to user.
  `,

  properties: [
    {
      name: 'outputter',
      factory: function() {
        return foam.nanos.export.GoogleSheetsOutputter.create();
      },
      hidden: true,
      flags: ['js']
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.export.report.Template',
      name: 'template',
      view: function(args, X) {
        var expr = foam.mlang.Expressions.create();
        if ( ! X.serviceName ) return [];
        var choices = X.reportTemplateDAO.where(expr.EQ(foam.nanos.export.report.Template.DAO_KEY, X.serviceName.split('/')[1]));
        
        return foam.u2.view.ChoiceView.create({
            placeholder: 'Please select template...',
            dao: choices,
            objToChoice: function(a) {
              return [a.id, a.docTitle];
          }
        });
      },
      // factory: function() {
      //   var expr = foam.mlang.Expressions.create();
      //   if ( ! this.serviceName ) return [];

      //   return this.__subContext__.reportTemplateDAO.find(expr.EQ(foam.nanos.export.report.Template.DAO_KEY, X.serviceName.split('/')[1]));
      // }
    },
    {
      name: 'serviceName',
      class: 'String'
    }
  ],

  methods: [
    async function exportFObject(X, obj) {
      var self = this;
      
      var sheetId  = '';
      var stringArray = [];
      var columnConfig = X.columnConfigToPropertyConverter;

      var propNames = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(obj.cls);
      propNames = columnConfig.filterExportedProps(X, obj.cls_, propNames);
      
      var metadata = await self.outputter.getColumnMethadata(X, obj.cls_, propNames);
      stringArray = [ await this.outputter.objectToTable(X, obj.cls_, obj, propNames) ];

      sheetId = await X.googleSheetsDataExport.createSheetAndPopulateWithData(X, stringArray, metadata, this);
      if ( ! sheetId || sheetId.length === 0)
        return '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    },
    async function exportDAO(X, dao) {
      var self = this;

      var columnConfig = X.columnConfigToPropertyConverter;

      var propNames = this.template && this.template.columnNames && this.template.columnNames.length > 0 ? this.template.columnNames : X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      propNames = columnConfig.filterExportedProps(dao.of, propNames);

      var metadata = await self.outputter.getColumnMethadata(X, dao.of, propNames);

      // to backend
      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, propNames);
      var sink = await dao.select(expr);
      
      var sheetId  = '';
      var stringArray = await self.outputter.returnTable(X, dao.of, propNames, sink.array);

      if ( this.template )
        sheetId = await X.googleSheetsDataExport.createSheetByCopyingTemplate(X, stringArray, metadata, this);
      else
        sheetId = await X.googleSheetsDataExport.createSheetAndPopulateWithData(X, stringArray, metadata, this);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    }
  ]
});