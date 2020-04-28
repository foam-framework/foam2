/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnConfig',
  sections: [{ name: '_defaultSection' }],
  properties: [
    {
      class: 'Class',
      name: 'of',
      hidden: true
    },
    {
      name: 'axiom',
      hidden: true
    },
    {
      class: 'String',
      name: 'label',
      label: '',
      visibility: 'RO',
      expression: function(of, axiom) {
        return axiom.label || foam.String.labelize(axiom.name);
      },
      gridColumns: 6
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  requires: [
    'foam.u2.DetailView',
    'foam.u2.view.ColumnOptionsSelectConfig'
  ],
  properties: [
    {
      class: 'Class',
      name: 'of',
      hidden: true
    },
    {
      name: 'columnsAvailable',
      hidden: true
    },
    {
      name: 'columns',
      factory: function() {
        var arr = [];
        for (var i = 0; i < this.selectedColumnNames.length; i++) {
          arr.push(this.ColumnOptionsSelectConfig.create({selectedColumns: this.selectedColumnNames[i], of:this.of, columnsAvailable:this.columnsAvailable}));
        }
        return arr;
      },
      view: {
        class: 'foam.u2.view.FObjectArrayView',
        of: 'foam.u2.view.ColumnOptionsSelectConfig',
        valueView: 'foam.u2.view.ColumnConfigPropView'
      }
    },
    {
      name: 'selectedColumnNames',
      hidden: true
    }
  ],
  // This shouldn't be needed.
  imports: [
    'stack'
  ],
  actions: [
    {
      name: 'cancel',
      code: function() {
        this.stack.back();
      },
      view: function() {
        return {
          class: 'foam.u2.ActionView',
          action: this,
          buttonStyle: 'SECONDARY'
        };
      }
    },
    {
      name: 'add',
      code: function() {//fix to tableColumns
        this.columns.forEach(c => c.visibility = 'DEFAULT');
      },
      confirmationRequired: true
    },
    // {
    //   name: 'resetAll',
    //   code: function() {//fix to tableColumns
    //     this.columns.forEach(c => c.visibility = 'DEFAULT');
    //   },
    //   confirmationRequired: true
    // },
    {
      name: 'save',
      code: function() {
        // if ( this.view.isColumnChanged ) {
          localStorage.removeItem(this.data.of.id);
          localStorage.setItem(this.data.of.id, JSON.stringify(this.data.selectedColumnNames));
          this.data.isColumnChanged = !this.data.isColumnChanged;
        // }
        this.stack.back();
      }
    }
  ],
  methods: [
    function toE() {
      return this.DetailView.create({ data: this });
    }
  ]
});
