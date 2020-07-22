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
      class: 'Int',
      postSet: function() {
        console.warn(
          `WizardPosition should not be mutated; ` +
          `create a new WizardPosition to guarentee slot updates`);
      }
    },
    {
      name: 'sectionIndex',
      class: 'Int',
      postSet: function() {
        console.warn(
          `WizardPosition should not be mutated; ` +
          `create a new WizardPosition to guarentee slot updates`);
      }
    },
  ],
});