/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'AbstractSectionedDetailView',
  extends: 'foam.u2.View',

  documentation: `
    The abstract for property-sheet style Views with sections for editing an FObject.
  `,

  requires: [
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      expression: function(data) {
        return data && data.cls_;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.layout.Section',
      name: 'sections',
      factory: null,
      expression: function(of) {
        if ( ! of ) return [];

        sections = of.getAxiomsByClass(this.SectionAxiom)
          .sort((a, b) => a.order - b.order)
          .map(a => this.Section.create().fromSectionAxiom(a, of));

        var usedAxioms = sections
          .map(s => s.properties.concat(s.actions))
          .flat()
          .reduce((map, a) => {
            map[a.name] = true;
            return map;
          }, {});
        var unusedProperties = of.getAxiomsByClass(this.Property)
            .filter(p => ! usedAxioms[p.name])
            .filter(p => ! p.hidden);
        var unusedActions = of.getAxiomsByClass(this.Action)
            .filter(a => ! usedAxioms[a.name]);
        if ( unusedProperties.length || unusedActions.length ) {
          sections.push(this.Section.create({
            properties: unusedProperties,
            actions: unusedActions
          }));
        }

        return sections;
      }
    }
  ]
});
