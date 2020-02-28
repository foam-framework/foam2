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
    'capabilityName', // TODO use as title(??) and set CapabilityName
    'argsList',
    {
      class: 'FObjectArray',
      of: 'foam.core.Class',
      name: 'ofList',
      documentation: 'Currently taking in a string of class paths',
      adapt: function(_, n) {
        return n.map((of) => typeof of === 'string' ? foam.lookup(of) : of);
      }
    },
    {
      name: 'sections',
      factory: null,
      expression: function(ofList) {
        if ( ! ofList ) return [];

        sections = ofList.map((of) => {
          let listOfSectionAxiomsFromClass = of.getAxiomsByClass(this.SectionAxiom);
          if ( listOfSectionAxiomsFromClass.length > 0 ) {
            var listOfSectionsFromClass = listOfSectionAxiomsFromClass
              .sort((a, b) => a.order - b.order)
              .map((a) => this.Section.create().fromSectionAxiom(a, of) );
            let unSectionedPropertiesSection = this.checkForUnusedProperties(listOfSectionsFromClass, of);
            if ( unSectionedPropertiesSection ) listOfSectionsFromClass.push(unSectionedPropertiesSection);
            return { 'data': of.create(this.argsList, this), 'sections': listOfSectionsFromClass };
          } else {
            var c = foam.layout.SectionAxiom.create({ name: of.name, title: of.name });
            let p = of.getAxiomsByClass(this.Property);
            let a = of.getAxiomsByClass(this.Action);
            return { 'data': of.create(this.argsList, this), 'sections': [this.Section.create({ properties: p, actions: a }).copyFrom(c)] };
          }
        });

        return sections;
      }
    }
  ],

  methods: [
    {
      name: 'checkForUnusedProperties',
      code: function(sections, of) {
        var usedAxioms = sections
          .map((s) => s.properties.concat(s.actions))
          .flat()
          .reduce((map, a) => {
            map[a.name] = true;
            return map;
          }, {});
        var unusedProperties = of.getAxiomsByClass(this.Property)
          .filter((p) => ! usedAxioms[p.name])
          .filter((p) => ! p.hidden);
        var unusedActions = of.getAxiomsByClass(this.Action)
          .filter((a) => ! usedAxioms[a.name]);

        if ( unusedProperties.length || unusedActions.length ) {
          return this.Section.create({
            properties: unusedProperties,
            actions: unusedActions
          });
        }
        return undefined;
      }
    }
  ]
});
