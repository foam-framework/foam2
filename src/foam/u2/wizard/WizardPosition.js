foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'WizardPosition',

  documentation: `
    Identifies a specific screen in a StepWizardlet view by specifying:
    - the index in an array of wizardlets, and
    - the index of a section in the data model
  `,

  properties: [
    {
      name: 'wizardletIndex',
      class: 'Int'
    },
    {
      name: 'sectionIndex',
      class: 'Int'
    }
  ],

  methods: [
    function compareTo(b) {
      let a = this;
      let wizardletDiff = a.wizardletIndex - b.wizardletIndex;
      if ( wizardletDiff != 0 ) return wizardletDiff;
      return a.sectionIndex - b.sectionIndex;
    }
  ]
});