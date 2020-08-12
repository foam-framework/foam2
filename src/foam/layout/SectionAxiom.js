/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.layout',
  name: 'SectionAxiom',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'title',
      expression: function(name) {
        if ( name === '_defaultSection' ) return '';
        return foam.String.labelize(name);
      }
    },
    {
      name: 'subTitle'
    },
    {
      class: 'String',
      name: 'help'
    },
    {
      class: 'Int',
      name: 'order',
      value: Number.MAX_SAFE_INTEGER
    },
    {
      class: 'Boolean',
      name: 'permissionRequired'
    },
    {
      name: 'gridColumns'
    },
    {
      class: 'Function',
      name: 'isAvailable',
      value: function() { return true; }
    },
    {
      class: 'String',
      name: 'section',
      getter: function() { return this.section_ ; },
      setter: function(m) { this.section_ = m; }
    },
    {
      class: 'Simple',
      name: 'section_'
    }
  ],

  methods: [
    function createIsAvailableFor(data$) {
      var self = this;
      var slot = foam.core.ExpressionSlot.create({
        obj$: data$,
        code: this.isAvailable
      });
      var availabilitySlots = [slot];

      // Conditionally, add permission check, (permSlot)
      if ( this.permissionRequired ) {
        var permSlot = foam.core.SimpleSlot.create({value: false});
        var update = function() {
          var data = data$.get();
          if ( data && data.__subContext__.auth ) {
            data.__subContext__.auth.check(null,
              `${data.cls_.id.toLowerCase()}.section.${self.name}`).then((hasAuth) => {
                permSlot.set(hasAuth);
              });
          }
        };
        update();
        data$.sub(update);
        availabilitySlots.push(permSlot);
      }

      // Add check for at least one visible property (propVisSlot)
      var data = data$.get();
      var propVisSlot = foam.core.ArraySlot.create({
        slots: data.cls_.getAxiomsByClass(foam.core.Property).filter(
          p => p.section == this.name
        ).map(
          p => p.createVisibilityFor(data$,
            data.__subContext__.controllerMode$ ||
            data.__subContext__.ctrl.controllerMode$
          )
        )
      }).map(arr => arr.some(m => {
        return m != foam.u2.DisplayMode.HIDDEN
      }));
      availabilitySlots.push(propVisSlot);

      return foam.core.ArraySlot.create({slots: availabilitySlots}).map(arr => {
        return arr.every(b => b);
      });
    },

    function installInClass(cls) {
      cls['SECTION_'+foam.String.constantize(this.name)] = this;
    }
  ]
});


foam.CLASS({
  package: 'foam.layout',
  name: 'PropertySectionRefine',
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'String',
      name: 'section',
      value: '_defaultSection'
    }
  ]
});


foam.CLASS({
  package: 'foam.layout',
  name: 'ActionSectionRefine',
  refines: 'foam.core.Action',

  properties: [
    {
      class: 'String',
      name: 'section',
      value: '_defaultSection'
    }
  ]
});


foam.CLASS({
  package: 'foam.layout',
  name: 'ModelSectionRefine',
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'foam.layout.SectionAxiom',
      name: 'sections'
    }
  ]
});
