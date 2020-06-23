foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ImportFromGoogleSheetsModal',
  extends: 'foam.u2.View',
  properties: [
    {
      name: 'importConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.google.api.sheets.GoogleSheetsImportConfig',
      factory: function() {
        return foam.nanos.google.api.sheets.GoogleSheetsImportConfig.create({of: this.__context__.data.of});
      }
    },
    {
      name: 'columns',
      class: 'StringArray'
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
      .startContext({ data: this })
      .tag(this.importConfig)
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
        // .tag({
        //   class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
        //   back: this.CANCEL,
        //   next: this.IMPORT_DATA
        // })
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
      isEnabled: function(columns, importConfig$googleSheetLink, importConfig$cellsRange) {
        return columns.length == 0 && importConfig$googleSheetLink && importConfig$cellsRange;
      },
      code: function(X) {
        X.googleSheetsDataImport.getColumns(X, this.importConfig).then(r => {
          this.columns = r;
          console.log(r);
        });
      }
    },
    {
      name: 'importData',
      label: 'Import',
      isEnabled: function(columns) {
        return !columns;
      },
      code: function(X) {
      }
    },
  ]
});