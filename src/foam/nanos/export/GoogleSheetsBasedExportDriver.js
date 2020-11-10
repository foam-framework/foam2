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
              return [a.id, a.name];
          }
        });
      }
    },
    {
      name: 'serviceName',
      class: 'String',
      hidden: true
    },
    {
      name: 'exportClsInfo',
      class: 'Class',
      javaType: 'foam.core.ClassInfo',
      hidden: true
    }
  ],

  methods: [
    async function exportFObjectAndReturnSheetId(X, obj) {
      var self = this;
      
      var sheetId  = '';
      var columnConfig = X.columnConfigToPropertyConverter;

      var propNames = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(obj.cls);
      propNames = columnConfig.filterExportedProps(X, obj.cls_, propNames);
      
      var metadata = await self.outputter.getColumnMethadata(X, obj.cls_, propNames);
      var stringArray = [ await this.outputter.objectToTable(X, obj.cls_, obj, propNames) ];

      sheetId = await X.googleSheetsDataExport.createSheetAndPopulateWithData(X, metadata, this);
      if ( this.template )
        sheetId = await X.googleSheetsDataExport.createSheetByCopyingTemplateAndFronEndData(X, stringArray, metadata, this);
      else
        sheetId = await X.googleSheetsDataExport.createSheetAndPopulateWithFrontEndData(X, stringArray, metadata, this);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      return sheetId;
    },
    async function exportDAOAndReturnSheetId(X, dao) {
      this.serviceName = X.serviceName.includes('/') ? X.serviceName.split('/')[1] : X.serviceName;
      var self = this;
      this.exportClsInfo = dao.of;

      var columnConfig = X.columnConfigToPropertyConverter;

      var propNames;
      if ( ! this.template )
        propNames =  X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      else {
        var expr1 = foam.mlang.Expressions.create();
        var template = await X.reportTemplateDAO.find(expr1.EQ(foam.nanos.export.report.Template.ID, this.template));
        propNames = template && template.columnNames && template.columnNames.length > 0 ? template.columnNames : X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      }
      var lengthOfPrimaryPropsRequested = propNames.length;
       
      propNames = columnConfig.filterExportedProps(dao.of, propNames);

      var metadata = await self.outputter.getColumnMetadata(X, dao.of, propNames);

      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, propNames);
      var sink = await dao.select(expr);
      
      var sheetId  = '';
      var stringArray = await self.outputter.returnTable(X, dao.of, propNames, sink.projection, lengthOfPrimaryPropsRequested);

      var sheetId  = '';

      if ( this.template )
        sheetId = await X.googleSheetsDataExport.createSheetByCopyingTemplateAndFronEndData(X, stringArray, metadata, this);
      else
        sheetId = await X.googleSheetsDataExport.createSheetAndPopulateWithFrontEndData(X, stringArray, metadata, this);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      return sheetId;
    }
  ]
});
