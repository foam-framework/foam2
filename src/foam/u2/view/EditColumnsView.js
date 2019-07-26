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
            var v = this.ColumnVisibility[localStorage.getItem(this.of.id + '.' + a.name)];
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
      hidden: true
    }
  ],
  // This shouldn't be needed.
  imports: [
    'stack'
  ],
  actions: [
    {
      name: 'resetAll',
      code: function() {
        this.columns.forEach(c => c.visibility = 'DEFAULT');
      }
    },
    {
      name: 'cancel',
      code: function() {
        this.stack.back();
      }
    },
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
