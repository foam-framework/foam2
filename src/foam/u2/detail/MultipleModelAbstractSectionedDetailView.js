/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'MultipleModelAbstractSectionedDetailView',
  extends: 'foam.u2.View',

  documentation: `
    The abstract for property-sheet style Views with sections for editing an FObject. Takes in an array 'of' of Classes for 'of' prop
  `,

  requires: [
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom'
  ],

  properties: [
    'capabilityName',
    {
      name: 'args',
      class: 'Object'
    },
    {
      class: 'StringArray',
      name: 'ofList',
      preSet: function(o, n) {
        let arg = null;
        if ( args ) arg = args;
        let m = n.map((of) => of.create(arg, this));
        this.propList = m.map((model) => model.cls_.getAxiomsByClass(this.Property));
        this.actionList = m.map((model) => model.cls_.getAxiomsByClass(this.Action));
        // sectionList needs to be created after propList and actionList, because of this.createSectionAxiom
        this.sectionList = m.map((model) => {
          let of = model.cls_;
          let a = of.getAxiomsByClass(this.SectionAxiom);
          return a.map((b) => this.createSectionAxiom(b));
        });
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObjectProperty',
      name: 'propList'
    },
    {
      class: 'FObjectArray',
      of: 'foam.layout.Section',
      name: 'sectionList',
      preSet: function(o, n) {
        return n.sort((a, b) => a.order - b.order);
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actionList'
    },
    {
      class: 'FObjectProperty',
      name: 'data',
      // TODO generate a model for this property - will be saved onto capability once finished
      factory: function() {
        return this.hasOwnProperty('of') ? this.of.create(null, this) : null;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.layout.Section',
      name: 'sections',
      factory: null,
      expression: function() {
        var sections = this.sectionList;
        var usedAxioms = sections
          .map((s) => s.properties.concat(s.actions))
          .flat()
          .reduce((map, a) => {
            map[a.name] = true;
            return map;
          }, {});
        var unusedProperties = this.propList
            .filter((p) => ! usedAxioms[p.name])
            .filter((p) => ! p.hidden);
        var unusedActions = this.actionList
            .filter((a) => ! usedAxioms[a.name]);

        if ( unusedProperties.length || unusedActions.length ) {
          sections.push(this.Section.create({ // TODO - find out why we do this? new section with unused values??
            properties: unusedProperties,
            actions: unusedActions
          }));
        }

        if ( this.propertyWhitelist ) {
          sections = sections
            .map((s) => {
              s.properties = s.properties.reduce((acc, sectionProp) => {
                var prop = this.propertyWhitelist.find((whitelistProp) => whitelistProp.name === sectionProp.name);
                if ( prop ) acc.push(prop);
                return acc;
              }, []);
              return s;
            })
            .filter((s) => {
              return s.properties.length > 0 || s.actions.length > 0;
            });
        }

        // Filter out any sections where we know that there are no actions and
        // no visible properties. Note that this isn't a comprehensive check.
        // For example, the visibility value could be a function, which means
        // it could be hidden under certain conditions and visible otherwise.
        sections = sections.filter((s) => {
          return s.actions.length > 0 ||
            s.properties.some((p) => {
              var visVal = this.controllerMode.getVisibilityValue(p);
              return visVal !== foam.u2.DisplayMode.HIDDEN && visVal !== 'HIDDEN';
            });
        });

        return sections;
      }
    }
  ],

  methods: [
    function createSectionAxiom(a) {
      var section = this.Section.create(a, this);
      section.copyFrom({
        createIsAvailableFor: this.createIsAvailableFor.bind(a), // TODO: answer, Thought, since we are building a model for a user, isn't it best to just check if createIsAvailable
        properties: this.propList
          .filter((p) => p.section == a.name)
          .filter((p) => ! p.hidden)
          .sort((p1, p2) => p1.order - p2.order),
        actions: this.actionList
          .filter((action) => action.section == a.name)
      });

      return section;
    },

    function createIsAvailableFor(data$) {
      var update = () => {
        var data = data$.get();
        if ( data && data.__subContext__.auth ) {
          data.__subContext__.auth.check(null,
            `${this.capabilityName.toLowerCase()}.section.${data.name}`).then((hasAuth) => {
              permSlot.set(hasAuth);
            });
        }
      };
      var slot = foam.core.ExpressionSlot.create({
        obj$: data$,
        code: data$.get().isAvailable
      });
      if ( data.permissionRequired ) {
        var permSlot = foam.core.SimpleSlot.create({ value: false });
        update();
        data$.sub(update);
        slot = foam.core.ArraySlot.create({ slots: [slot, permSlot] }).map((arr) => {
          return arr.every((b) => b);
        });
      }
      return slot;
    }
  ]
});
