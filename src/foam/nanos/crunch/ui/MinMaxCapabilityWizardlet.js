foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'MinMaxCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  properties: [
    {
      // TODO: remove value this is just here for testing
      name:  'of',
      class: 'Class',
      value: 'foam.nanos.cron.TimeHMS'
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet',
      name: 'choiceWizardlets',
      factory: function() {
        return []
      }
    },
    {
      name: 'choices',
      expression: function(choiceWizardlets){
        return choiceWizardlets.map(wizardlet => [wizardlet.title, wizardlet.title, wizardlet.isAvailable$, foam.u2.DisplayMode.RW])
      }
    }
  ],

  methods: [
    function createView() {
      // TODO: Implement create view method based on the choices property and the MultiChoiceView with choiceView as CardSelectView
      // TODO: Wire up wizard to see if createView returns null then render default SDV otherwise render the method output
      return null;
    }
  ]
});
