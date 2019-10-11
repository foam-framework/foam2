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
      class: 'FObjectProperty',
      name: 'data',
      factory: function() {
        return this.hasOwnProperty('of') ? this.of.create(null, this) : null;
      },
      postSet: function() {
        this.of = undefined;
      }
    },
    {
      class: 'Class',
      name: 'of',
      expression: function(data) {
        return data && data.cls_;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'propertyWhiteList',
      documentation: `
        If this array is not empty, only the properties listed in it will be
        included in the detail view.
      `,
      preSet: function(_, ps) {
        foam.assert(ps, 'Properties required.');
        for ( var i = 0; i < ps.length; i++ ) {
          foam.assert(
              foam.core.Property.isInstance(ps[i]),
              `Non-Property in 'properties' list:`,
              ps);
        }
        return ps;
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
          .map((a) => this.Section.create().fromSectionAxiom(a, of));

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
          sections.push(this.Section.create({
            properties: unusedProperties,
            actions: unusedActions
          }));
        }

        if ( this.propertyWhitelist ) {
          sections = sections
            .map((s) => {
              s.properties = s.properties.filter((p) => this.propertyWhitelist.includes(p));
              return s;
            })
            .filter((s) => {
              return s.properties.length > 0 || s.actions.length > 0;
            });
        }

        return sections;
      }
    }
  ]
});
