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
      class: 'Array',
      name: 'useSections',
      documentation: `List of sections to be used in section detail view. Set if you would like to
          filter section list, alternative to default behaviour where all sections of class and parent classes are used.`
    },
    {
      class: 'FObjectProperty',
      name: 'data',
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
      expression: function(data) {
        return data && data.cls_;
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
      adapt: function(_, newValue) {
        if ( Array.isArray(newValue) ) return newValue;
        if ( typeof newValue !== 'object' ) throw new Error('You must set propertyWhitelist to an array of properties or a map from names to overrides encoded as an object.');
        return Object.entries(newValue).reduce((acc, [propertyName, overrides]) => {
          var axiom = this.of.getAxiomByName(propertyName);
          if ( axiom ) acc.push(axiom.clone().copyFrom(overrides));
          return acc;
        }, []);
      },
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
        // Why not Section.AXIOM.ORDER on next line?
        .sort((a, b) => a.order - b.order)
        .reduce((map, a) => {
          if ( this.useSections.length ) {
            if ( this.useSections.includes(a.name) ) {
              map.push(this.Section.create().fromSectionAxiom(a, of));
            }
          } else {
            map.push(this.Section.create().fromSectionAxiom(a, of));
          }
          return map;
        }, []);

        var usedAxioms = sections
          .map((s) => s.properties.concat(s.actions))
          .flat()
          .reduce((map, a) => {
            map[a.name] = true;
            return map;
          }, {});


        if ( ! this.useSections.length ) {
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

        // Filter out any sections where we know that there are no actions and
        // no visible properties. Note that this isn't a comprehensive check.
        // For example, the visibility value could be a function, which means
        // it could be hidden under certain conditions and visible otherwise.
        sections = sections.filter(s => {
          return s.actions.length > 0 ||
                 s.properties.some(p => {
                   var visVal = this.controllerMode.getVisibilityValue(p);
                   return visVal !== foam.u2.DisplayMode.HIDDEN && visVal !== 'HIDDEN';
                 });
        });

        return sections;
      }
    }
  ]
});
