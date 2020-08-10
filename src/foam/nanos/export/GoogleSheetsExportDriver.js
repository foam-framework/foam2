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
      class: 'Reference',
      of: 'foam.nanos.export.report.Template',
      name: 'template',
      targetDAOKey: 'reportTemplateDAO',
      view: function(args, X) {
        var expr = foam.mlang.Expressions.create();
        if ( ! X.serviceName ) return [];
        
        return foam.u2.view.ChoiceView.create({
            placeholder: 'Please select template...',
            dao: X.reportTemplateDAO.where(expr.EQ(foam.nanos.export.report.Template.DAO_KEY, X.serviceName.split('/')[1])),
            objToChoice: function(a) {
              return [a.id, a.docTitle];
          }
        });
      }
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

      var propNames;
      if ( ! this.template )
        propNames =  X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      else {
        var expr1 = foam.mlang.Expressions.create();
        var template = await X.reportTemplateDAO.find(expr1.EQ(foam.nanos.export.report.Template.ID, this.template));
        propNames = template && template.columnNames && template.columnNames.length > 0 ? this.template.columnNames : X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      }
       
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