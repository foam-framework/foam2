/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.view',
  name: 'ColumnVisibility',
  values: [
    {
      name: 'DEFAULT',
    },
    {
      name: 'ALWAYS_SHOW',
    },
    {
      name: 'ALWAYS_HIDE',
    },
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnConfig',
  sections: [{ name: '_defaultSection' }],
  properties: [
    {
      class: 'String',
      name: 'name',
      hidden: true
    },
    {
      class: 'String',
      name: 'label',
      label: '',
      visibility: 'RO',
      gridColumns: 6
    },
    {
      class: 'Enum',
      of: 'foam.u2.view.ColumnVisibility',
      name: 'visibility',
      label: '',
      gridColumns: 6
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  requires: [
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
        return this.allColumns
          .map(c => {
            var a = this.of.getAxiomByName(c);
            var v = localStorage.getItem(this.of.id + '.' + a.name);
            v = this.ColumnVisibility.VALUES.find(e => e.name == v);
            return this.ColumnConfig.create({
              name: a.name,
              label: a.label || foam.String.labelize(a.name),
              visibility: v || 'DEFAULT'
            })
          })
      }
    },
    {
      class: 'StringArray',
      name: 'allColumns',
      factory: function() {
        var props = this.of.getAxiomsByClass(foam.core.Property)
          .filter(p => p.tableCellFormatter && ! p.hidden)
          .map(p => p.name);
        var actions = this.of.getAxiomsByClass(foam.core.Action)
          .map(a => a.name);
        return props.concat(actions);
      },
      hidden: true
    }
  ],
  // This shouldn't be needed.
  imports: [
    'stack'
  ],
  actions: [
    {
      name: 'save',
      code: function() {
        this.columns.forEach(c => {
          var id = this.of.id + '.' + c.name;
          localStorage.removeItem(id);
          if ( c.visibility === foam.u2.view.ColumnVisibility.DEFAULT ) return;
          localStorage.setItem(id, c.visibility.label);
        });
        this.stack.back();
      }
    }
  ]
});
