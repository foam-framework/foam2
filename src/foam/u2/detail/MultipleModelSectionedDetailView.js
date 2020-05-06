/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'MultipleModelSectionedDetailView',
  extends: 'foam.u2.View',

  documentation: `Takes in a list of class paths in "ofList" representing the MultipleModels
  and creates a section list in "sections" for editing properties.`,

  requires: [
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom'
  ],

  properties: [
    {
      class: 'Array',
      name: 'argsList',
      documentation: 'Contains key for submitting data. It is the id of the data we want to update.'
    },
    {
      class: 'Array',
      name: 'daoList',
      documentation: 'Contains the daoKey for source model, specifying where data should be submitted too.'
    },
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
      name: 'sectionsList'
    },
    {
      class: 'Array',
      name: 'capsList',
      documentation: 'Contains ids of capabilities to create ucjs with.'
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
