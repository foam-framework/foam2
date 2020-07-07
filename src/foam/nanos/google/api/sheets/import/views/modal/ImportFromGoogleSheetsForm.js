foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ImportFromGoogleSheetsForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',
  exports: [
    'importConfig',
    'importServiceName'
  ],
  css: `
  ^ {
    width: 500px;
    height: 500px;
    // padding: 16px;
    overflow-x: scroll;
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
    function init() {
      this.SUPER();
      // var self = this;
      this.views = {
        'googleSheetLink'        : { view: { class: 'foam.nanos.google.api.sheets.GoogleSheetImportModal' }, startPoint: true },
        'columnsMapping'         : { view: { class: 'foam.nanos.google.api.sheets.ColumnsToPropertiesMappingModal' } }
      };
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});