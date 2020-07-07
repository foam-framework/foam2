foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetImportModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  imports: [
    'importConfig',
    'importServiceName'
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.start()
        .tag(this.importConfig)
      .end();
      this.start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).end();
    }
  ],
  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Continue',
      isEnabled: function(importConfig$googleSpreadsheetId) {
        return importConfig$googleSpreadsheetId;
      },
      code: async function(X) {
        await X.googleSheetsDataImport.getColumns(X, this.importConfig).then(columnHeaders => {
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
        this.pushToId('columnsMapping');
      }
    }
  ]
});