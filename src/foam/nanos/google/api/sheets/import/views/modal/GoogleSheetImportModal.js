/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetImportModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  imports: [
    'importConfig',
    'importServiceName'
  ],
  css: `
  ^footer {
    width: 100%;
    position: absolute;
    bottom: 0;
  }
  `,
  methods: [
    function initE() {
      this.SUPER();
      this
      .start('h2')
        .style({'padding-left': '8px'})
        .add('Link to Document')
      .end()
      .start()
        .tag(this.importConfig)
      .end();
      this.start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).addClass(this.myClass('footer')).end();
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
      code: async function(X) {
        if ( ! this.importConfig.googleSpreadsheetId ) {
          return;
        }
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