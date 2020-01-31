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
        valueView: { class: 'foam.u2.view.ColumnConfigView' },
        mode: 'RO',
        enableAdding: false,
        enableRemoving: false
      },
      factory: function() {
        var rtn = this.allColumns.map(([axiomName, overridesMap]) => {
          const axiom = this.of.getAxiomByName(axiomName);
          if ( overridesMap ) axiom = axiom.clone().copyFrom(overridesMap);
          return this.ColumnConfig.create({ of: this.of, axiom: axiom });
        });

        // Sort columns alphabetically. This doesn't quite work since what we
        // actually display is up to tableHeaderFormatter, which works directly
        // with the view instead of returning a String, so there's no way for
        // us to actually know what the user is going to see.
        rtn.sort((l, r) => l.label < r.label ? -1 : 1);

        return rtn;
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
