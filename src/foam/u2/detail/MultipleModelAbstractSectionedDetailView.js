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
    'argsList',
    {
      class: 'FObjectArray',
      of: 'foam.core.Class',
      name: 'ofList',
      preSet: function(_, n) {
        return [net.nanopay.sme.onboarding.BusinessOnboarding, foam.nanos.u2.navigation.SignIn];
      }
    },
    {
      name: 'createdModels',
      class: 'FObjectArray',
      of: 'foam.core.FObject',
    },
    {
      name: 'sections',
      factory: null,
      expression: function(ofList) {
        if ( ! ofList ) return [];

        sections = ofList.map((of) => {
          let b = of.getAxiomsByClass(this.SectionAxiom);
          if ( b.length > 0 ) {
            // todo consider properties that are not in sections
            var t = b.sort((a, b) => a.order - b.order).map((a) => this.Section.create().fromSectionAxiom(a, of) );
            return { 'data': of.create(this.argsList, this), 'sections': t };
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
  ]
});

