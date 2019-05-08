/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'AbstractSectionedDetailView',
  extends: 'foam.u2.View',

   documentation : `
    The abstract for property-sheet style Views with sections for editing an FObject.
  `,

   requires: [
    'foam.u2.SectionedDetailPropertyView',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom',
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
      expression: function(of) { // We should fix this!
        if ( ! of ) return [];

         var sectionAxioms = of.getAxiomsByClass(this.SectionAxiom)
          .map(sectionAxiom => this.Section.create({
            isAvailable: sectionAxiom.isAvailable,
            order: sectionAxiom.order,
            title: sectionAxiom.label,
            properties: of.getAxiomsByClass(this.Property)
              .filter(p => p.section == sectionAxiom.name)
              .filter(p => ! p.hidden),
            actions: of.getAxiomsByClass(this.Action)
              .filter(a => a.section == sectionAxiom.name)
          }))

           // need to abide by the Order property and sort in increasing order
          var orderedSectionAxioms = sectionAxioms.sort((a,b) => a.order -  b.order);

           /**
           * We are gathering all the unsectioned properties 
           * and placing them in their own section at the  end
           */
          orderedSectionAxioms.push(this.Section.create({
            title: 'Unsectioned Properties',
            properties: of.getAxiomsByClass(this.Property)
              .filter(p => ! p.section)
              .filter(p => ! p.hidden),
            actions: of.getAxiomsByClass(this.Action)
              .filter(a => ! a.section)
          }));

           return orderedSectionAxioms;
      }
    }
  ]
});
