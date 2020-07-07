foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ImportDataModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  imports: [
    'importConfig',
    'importServiceName'
  ],
  methods: [
    function initE() {
      this.SUPER();

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
      label: 'Import',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});