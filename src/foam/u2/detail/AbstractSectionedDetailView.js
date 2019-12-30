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
      name: 'data',
      documentation: `
      * This prop(property) is now legacy.
      There was an intersection where 'data' was not meant to be the same
      as the wizard model to be used - which was with the faceted pattern which is also using prop 'data'.

      For current code integration, we redirect 'data' property to 'buildModel'.
      `,
      postSet: function(o, n) {
        if ( n && ! this.buildModel ) this.buildModel = n;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'buildModel',
      factory: function() {
        return this.hasOwnProperty('of') ? this.of.create(null, this) : null;
      },
      postSet: function(oldValue, newValue) {
        this.of = newValue ? newValue.cls_ : undefined;
      }
    },
    {
      class: 'Class',
      name: 'of',
      expression: function(buildModel) {
        return buildModel && buildModel.cls_;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'propertyWhitelist',
      documentation: `
        If this array is not empty, only the properties listed in it will be
        included in the detail view.
      `,
      factory: null,
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
              s.properties = s.properties.reduce((acc, sectionProp) => {
                var prop = this.propertyWhitelist.find(whitelistProp => whitelistProp.name === sectionProp.name);
                if ( prop ) acc.push(prop);
                return acc;
              }, []);
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
