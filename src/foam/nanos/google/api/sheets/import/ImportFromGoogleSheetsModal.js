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
        return foam.nanos.google.api.sheets.GoogleSheetsImportConfig.create({importClassInfo: this.__context__.data.of});
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
        .add(this.slot(function(columns){
          return this.E().forEach(columns, function(c) {
            var r = foam.nanos.google.api.sheets.ColumnHeaderToPropertyNameView.create({ of: self.importConfig.importClassInfo, columnHeader: c });
            this.tag(r);
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
      // isEnabled: function(columns, importConfig$googleSheetLink, importConfig$cellsRange) {
      //   return columns.length === 0 && importConfig$googleSheetLink && importConfig$cellsRange;
      // },
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


foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ColumnHeaderToPropertyNameView',
  properties: [
    {
      name: 'maxDepth',
      class: 'Int',
      value: 5,
      hidden: true
    },
    {
      name: 'of',
      hidden: true
    },
    {
      name: 'columnHeader',
      class: 'String',
      postSet: function() {
        this.findPropertyName();
      }
    },
    {
      name: 'propertiesOptions',
      // class: 'StringArray',
      hidden: true,
    },
    {
      name: 'selectedProp',
      class: 'StringArray',
      view: function(_, X) {
        return X.data.slot(function(propertiesOptions) {
          return foam.u2.view.ChoiceView.create({choices: propertiesOptions, data$: this.selectedProp$});
        });
      }
    }
  ],
  methods: [
    function findPropertyName() {
      var prop = this.of.getAxiomByName(this.columnHeader);
      if ( prop ) {
        this.propertyLabel = prop.label;
      }
      var props =  this.of.getAxiomsByClass(foam.core.Property).filter(p => ! p.networkTransient );
      var resultSoFar = [];
      var checkedClsIds = [ this.of.id ];
      var  i = 0;
      for ( prop of props ) {
        this.findPropOptions(prop, '', '', i, checkedClsIds, resultSoFar);
      }
      this.propertiesOptions = resultSoFar;
      console.log(resultSoFar);
    },
    function findPropOptions(prop, propNameSoFar, labelSoFar, i, checkedClsIds, resultSoFar) {

      propNameSoFar += propNameSoFar ? '.' + prop.name : prop.name;
      labelSoFar += labelSoFar ? ' -> ' + prop.label : prop.label;

      if ( foam.core.FObjectProperty.isInstance(prop) || foam.core.Reference.isInstance(prop) ) {
        checkedClsIds.push(prop.of.id);
      } else {
        if ( prop && prop.label === this.columnHeader ) {
          resultSoFar.push([propNameSoFar, labelSoFar]);
        }
        return;
      }

      var propChildren =  prop.of.getAxiomsByClass(foam.core.Property).filter(p => ! p.networkTransient &&  ( foam.core.FObjectProperty.isInstance(p) || foam.core.Reference.isInstance(p)  ? ! checkedClsIds.includes(p.of.id) : true ) );
      
      if ( ++i >= this.maxDepth ) return;

      for ( var p of propChildren ) {
        this.findPropOptions(p, propNameSoFar, labelSoFar, i, checkedClsIds, resultSoFar);
      }
      return;
    }
  ]
});