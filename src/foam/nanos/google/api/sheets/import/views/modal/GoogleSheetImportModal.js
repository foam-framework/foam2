/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetImportModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.NotificationMessage',
  ],
  imports: [
    'importConfig',
    'importServiceName',
    'ctrl'
  ],
  css: `
    ^footer {
      width: 100%;
      position: absolute;
      bottom: 0;
    }
  `,
  messages: [
    { name: 'ERROR_MSG', message: 'Something went wrong! Please contact support'},
  ],
  methods: [
    function initE() {
      this.SUPER();
      this
      .start('h2')
        .style({'padding-left': '16px'})
        .add('Link to Document')
      .end()
      .start()
        .tag(this.importConfig)
      .end();
      this.start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).addClass(this.myClass('footer')).end();
    },
    function isColumnHeaderReferncePropertyId(columnHeader, p) {
      return foam.core.Reference.isInstance(p) && p.of.getAxiomByName("id") && p.label === columnHeader.split('/')[0] && p.of.getAxiomByName("id").label === columnHeader.split('/')[1];
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
              var prop = this.importConfig.importClassInfo.getAxiomsByClass(foam.core.Property).find(p => ! p.networkTransient && ! foam.core.FObjectProperty.isInstance(p) && ! foam.Array.isInstance(p) && ! foam.core.StringArray.isInstance(p) && ( ( p.label === columnHeader ) || ( this.isColumnHeaderReferncePropertyId(columnHeader, p) ) ) );
              var colHeaderConfig = foam.nanos.google.api.sheets.ColumnHeaderToPropertyMapping.create({ of: this.importConfig.importClassInfo, columnHeader: columnHeader, prop: prop, isUnitValueProperty: foam.core.UnitValue.isInstance(prop) });

              if ( prop && prop.cls_.id === "foam.core.UnitValue" && prop.unitPropName ) {
                colHeaderConfig.unitProperty = this.importConfig.importClassInfo.getAxiomByName(prop.unitPropName);
              }

              arr.push(colHeaderConfig);
            }
            this.importConfig.columnHeaderPropertyMappings = arr;
            this.pushToId('columnsMapping');
          } else {
            this.ctrl.add(this.NotificationMessage.create({ message: this.ERROR_MSG, type: this.LogLevel.ERROR }));
            X.closeDialog();
          }
        });
      }
    }
  ]
});