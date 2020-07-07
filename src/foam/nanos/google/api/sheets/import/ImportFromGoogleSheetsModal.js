foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ImportFromGoogleSheetsModal',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],
  imports: [
    'ctrl'
  ],
  css: `
  ^footer{
    width: 100%;
    position: absolute;
    bottom: 0;
  }
  `,
  properties: [
    {
      name: 'importConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.google.api.sheets.GoogleSheetsImportConfig',
      expression: function(of, dao) {
        return foam.nanos.google.api.sheets.GoogleSheetsImportConfig.create({importClassInfo: of, DAO: dao});
      }
    },
    {
      name: 'importServiceName',
      class: 'String',
      value: 'googleSheetsDataImport'
    },
    'of',
    'dao'
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
      .start('h2').style({'padding-left': '16px'}).add('Google Sheets Data Import').end()
      .startContext({ data: this })
        .tag(this.importConfig)
        .add(this.slot(function(importConfig$columnHeaderPropertyMappings) {
          return this.E()
          .callIf(importConfig$columnHeaderPropertyMappings && importConfig$columnHeaderPropertyMappings.length > 0, function() {
            this.start('h4').style({ 'padding-left': '16px' }).add('Column headers').end().forEach(importConfig$columnHeaderPropertyMappings, function(c) {
              this.start()
              .style({ 'padding-left': '16px' })
                .start({class: 'foam.u2.TextField',
                  data: c.columnHeader
                })
                  .style({ 'background-color': c.prop ? 'none' : '#fbedec',
                           'color': c.prop ? 'none' : '#a61414' })
                  .setAttribute('readonly', true)
                .end()
                .callIf(! c.prop, function() {
                  this.start()
                    .style({ 'color': 'red' })
                    .add('Data for column with header "' + c.columnHeader + '" cannot be imported. You can still import your data but this column data will be ignored')
                  .end();
                })
              .end()
              .br();
            });
          });
        }))
        .start().show(this.showAction$).addClass(this.myClass('btn-box'))
          .tag(this.CANCEL, {
            buttonStyle: 'SECONDARY',
            size: 'LARGE'
          })
          .tag(this.GET_COLUMNS, {
            buttonStyle: 'SECONDARY',
            size: 'LARGE'
          })
          .tag(this.IMPORT_DATA, {
            buttonStyle: 'SECONDARY',
            size: 'LARGE'
          })
        .end()
      .endContext();
    }
  ],
  actions: [
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'getColumns',
      label: 'Get columns',
      isEnabled: function(importConfig$googleSpreadsheetId) {
        return importConfig$googleSpreadsheetId;
      },
      code: function(X) {
        X.googleSheetsDataImport.getColumns(X, this.importConfig).then(columnHeaders => {
          if ( columnHeaders ) {
            var arr = [];
            for ( var columnHeader of columnHeaders ) {
              var prop = this.importConfig.importClassInfo.getAxiomsByClass(foam.core.Property).find(p => ! p.networkTransient && ! foam.core.FObjectProperty.isInstance(p) && p.label === columnHeader);
              var colHeaderConfig = foam.nanos.google.api.sheets.ColumnHeaderToPropertyMapping.create({ of: this.importConfig.importClassInfo, columnHeader: columnHeader, prop: prop });

              if ( prop && prop.cls_.id === "foam.core.UnitValue" && prop.unitPropName ) {
                colHeaderConfig.unitProperty = this.importConfig.importClassInfo.getAxiomByName(prop.unitPropName);
              }

              arr.push(colHeaderConfig);
            }
            this.importConfig.columnHeaderPropertyMappings = arr;
          }          
        });
      }
    },
    {
      name: 'importData',
      label: 'Import',
      isEnabled: function(importConfig$columnHeaderPropertyMappings) {
        return importConfig$columnHeaderPropertyMappings.some(c => c && c.prop );
      },
      code: function(X) {
        X[this.importServiceName].importData(X, this.importConfig).then(r => {
          X.closeDialog();
          var message = this.NotificationMessage.create();
          if ( r ) message.message = 'success!';
          else {
            message.message = 'failure!';
            message.type = 'error';
          }
          this.ctrl.add(message);
        });
      }
    },
  ]
});