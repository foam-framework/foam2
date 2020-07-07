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
  ^error {
    border-color: #f91c1c;
    background-color: #fff6f6;
  }
  `,
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

        this.start('h4').style({ 'padding-left': '16px' }).add('Column headers').end().forEach(this.importConfig.columnHeaderPropertyMappings, function(c) {
          this.start()
              .style({ 'padding-left': '16px' })
            .end()
            .tag(this.SectionedDetailPropertyView, {
              data: c,
              prop: this.ColumnHeaderToPropertyMapping.COLUMN_HEADER
            })
          .br();
        })
      .start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).end();
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