foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ColumnsToPropertiesMappingModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],
  imports: [
    'importConfig',
    'importServiceName',
    'ctrl'
  ],
  methods: [
    function initE() {
      this.SUPER();


        this.start('h4').style({ 'padding-left': '16px' }).add('Column headers').end().forEach(this.importConfig.columnHeaderPropertyMappings, function(c) {
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