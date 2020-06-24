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
      class: 'FObjectArray',
      of: 'foam.nanos.google.api.sheets.ColumnHeaderToPropertyName'
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
            this.start()
              .start({class: 'foam.u2.TextField',
                data: c.columnHeader
              })
                .style({ 'background-color': c.prop ? 'none' : '#fbedec',
                         'color': c.prop ? 'none' : '#a61414' })
                .setAttribute('readonly', true)
              .end()
            .end();
            //if c.prop.label doesn't exist add error message
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
      isEnabled: function(importConfig$googleSpreadsheetId, importConfig$cellsRange) {
        return importConfig$googleSpreadsheetId && importConfig$cellsRange;
      },
      code: function(X) {
        X.googleSheetsDataImport.getColumns(X, this.importConfig).then(columnHeaders => {
          if ( columnHeaders ) {
            var arr = [];
            for ( var columnHeader of columnHeaders ) {
              arr.push(foam.nanos.google.api.sheets.ColumnHeaderToPropertyName.create({ of: this.importConfig.importClassInfo, columnHeader: columnHeader }));
            }
            this.columns = arr;
            importConfig.columnHeaderPropertyMappings = this.columns;
          }          
        });
      }
    },
    {
      name: 'importData',
      label: 'Import',
      isEnabled: function(columns) {
        return ! columns.some(c => ! ( c && c.prop ) );
      },
      code: function(X) {
        X.googleSheetsDataImport.importData(X, this.importConfig).then(r => 
        console.log(r)  
        );
      }
    },
  ]
});


foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ColumnHeaderToPropertyName',
  properties: [
    {
      name: 'of',
      hidden: true
    },
    {
      name: 'columnHeader',
      class: 'String',
      postSet: function() {
        this.prop = this.of.getAxiomsByClass(foam.core.Property).find(p => ! p.networkTransient && ! foam.core.FObjectProperty.isInstance(p) && p.label === this.columnHeader);
      },
      visibility: 'RO'
    },
    {
      name: 'prop',
      class: 'Object',
      javaType: 'foam.core.PropertyInfo',
      visibility: 'RO',
      view: {
        class: 'foam.u2.TextField',
        data: this.prop$label
      },
    }
  ]
});

//overkill
// foam.CLASS({
//   package: 'foam.nanos.google.api.sheets',
//   name: 'ColumnHeaderToPropertyName',
//   properties: [
//     {
//       name: 'maxDepth',
//       class: 'Int',
//       value: 5,
//       hidden: true
//     },
//     {
//       name: 'of',
//       hidden: true
//     },
//     {
//       name: 'columnHeader',
//       class: 'String',
//       postSet: function() {
//         this.findPropertyName();
//       }
//     },
//     {
//       name: 'propertiesOptions',
//       // class: 'StringArray',
//       hidden: true,
//     },
//     {
//       name: 'selectedProp',
//       class: 'StringArray',
//       view: function(_, X) {
//         return X.data.slot(function(propertiesOptions) {
//           return foam.u2.view.ChoiceView.create({choices: propertiesOptions, data$: this.selectedProp$});
//         });
//       }
//     }
//   ],
//   methods: [
//     function findPropertyName() {
//       var prop = this.of.getAxiomByName(this.columnHeader);
//       if ( prop ) {
//         this.propertyLabel = prop.label;
//       }
//       var props =  this.of.getAxiomsByClass(foam.core.Property).filter(p => ! p.networkTransient );
//       var resultSoFar = [];
//       var checkedClsIds = [ this.of.id ];
//       var  i = 0;
//       for ( prop of props ) {
//         this.findPropOptions(prop, '', '', i, checkedClsIds, resultSoFar);
//       }
//       this.propertiesOptions = resultSoFar;
//       console.log(resultSoFar);
//     },
//     function findPropOptions(prop, propNameSoFar, labelSoFar, i, checkedClsIds, resultSoFar) {

//       propNameSoFar += propNameSoFar ? '.' + prop.name : prop.name;
//       labelSoFar += labelSoFar ? ' -> ' + prop.label : prop.label;

//       if ( /** foam.core.FObjectProperty.isInstance(prop) || **/ foam.core.Reference.isInstance(prop) ) {
//         checkedClsIds.push(prop.of.id);
//       } else {
//         if ( prop && prop.label === this.columnHeader ) {
//           resultSoFar.push([propNameSoFar, labelSoFar]);
//         }
//         return;
//       }

//       var propChildren =  prop.of.getAxiomsByClass(foam.core.Property).filter(p => ! p.networkTransient &&  ( /** foam.core.FObjectProperty.isInstance(p) ||  **/ foam.core.Reference.isInstance(p)  ? ! checkedClsIds.includes(p.of.id) : true ) );
      
//       if ( ++i >= this.maxDepth ) return;

//       for ( var p of propChildren ) {
//         this.findPropOptions(p, propNameSoFar, labelSoFar, i, checkedClsIds, resultSoFar);
//       }
//       return;
//     }
//   ]
// });