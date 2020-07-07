/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ColumnsToPropertiesMappingModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.google.api.sheets.ColumnHeaderToPropertyMapping',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],
  imports: [
    'importConfig',
    'importServiceName',
    'ctrl',
    'notify'
  ],
  css: `
  ^{
    // padding: 16px;
  }
  ^footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    padding: 0;
  }
  `,
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

        this
          .start()
            .addClass(this.myClass())
            .start('h2')
              .style({'padding-left': '8px'})
              .add('Exported Columns:')
            .end()
            .forEach(self.importConfig.columnHeaderPropertyMappings, function(c) {
              self
              .start()
                .style({'padding': '0 8px'})
                .tag(self.SectionedDetailPropertyView, {
                  data: c,
                  prop: self.ColumnHeaderToPropertyMapping.COLUMN_HEADER
                })
              .end()
              .br();
            })
          .end()
          .start()
            .style({ 'padding-bottom': '120px' })
          .end()
          .start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).addClass(this.myClass('footer')).end();
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
        if ( ! this.importConfig.columnHeaderPropertyMappings.some(m => m.prop) ) {
          this.notify('It looks like data you\'re trying to import do not match out records. Please make sure that google sheet you\'re trying to import and data on the current page match', 'error');
          return;
        }

        await X[this.importServiceName].importData(X, this.importConfig).then(r => {
          var message = this.NotificationMessage.create();
          if ( r ) message.message = 'success!';
          else {
            message.message = 'failure!';
            message.type = 'error';
          }
          this.ctrl.add(message);
        });
        X.closeDialog();
      }
    }
  ],
});