/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.view',
  name: 'ColumnVisibility',
  values: [
    {
      name: 'DEFAULT',
      label: 'Default'
    },
    {
      name: 'ALWAYS_SHOW',
      label: 'Always Show'
    },
    {
      name: 'ALWAYS_HIDE',
      label: 'Always Hide'
    },
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnConfig',
  sections: [{ name: '_defaultSection' }],
  requires: [
    'foam.u2.view.ColumnVisibility'
  ],
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
      name: 'key',
      hidden: true,
      expression: function(of, axiom) { return of.id + '.' + axiom.name; }
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
    },
    {
      class: 'Enum',
      of: 'foam.u2.view.ColumnVisibility',
      name: 'visibility',
      label: '',
      gridColumns: 6,
      factory: function() {
        return this.ColumnVisibility[localStorage.getItem(this.key)] ||
               this.ColumnVisibility.DEFAULT;
      }
    }
  ],
  methods: [
    {
      name: 'save',
      code: function() {
        localStorage.removeItem(this.key);
        if ( this.visibility === this.ColumnVisibility.DEFAULT ) return;
        localStorage.setItem(this.key, this.visibility.name);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  requires: [
    'foam.u2.DetailView',
    'foam.u2.view.ColumnVisibility',
    'foam.u2.view.ColumnConfig'
  ],
  properties: [
    {
      class: 'Class',
      name: 'of',
      hidden: true
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.view.ColumnConfig',
      name: 'columns',
      view: {
        class: 'foam.u2.view.FObjectArrayView',
        valueView: {
          class: 'foam.u2.detail.SectionView',
          sectionName: '_defaultSection'
        },
        mode: 'RO'
      },
      factory: function() {
        return this.allColumns.map(c => {
          return this.ColumnConfig.create({ of: this.of, axiom: c });
        });
      }
    },
    {
      class: 'Array',
      name: 'allColumns',
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
      name: 'resetAll',
      code: function() {
        this.columns.forEach(c => c.visibility = 'DEFAULT');
      },
      confirmationRequired: true
    },
    {
      name: 'save',
      code: function() {
        this.columns.forEach(c => { c.save() });
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
