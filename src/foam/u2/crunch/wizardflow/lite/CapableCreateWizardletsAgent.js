foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CapableCreateWizardletsAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'capable'
  ],

  exports: [
    'wizardlets'
  ],

  properties: [
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    }
  ],

  methods: [
    async function execute() {
      var wizardlets = [];
      var capable = this.capable;

      for ( let i = 0 ; i < capable.capablePayloads.length ; i++ ) {
        let capablePayload = capable.capablePayloads[i];
        let wizardletClass = capablePayload.capability.wizardlet.cls_;

        // Override the default wizardlet class with one that does not
        //   save to userCapabilityJunction
        if ( wizardletClass.id == 'foam.nanos.crunch.ui.CapabilityWizardlet' ) {
          wizardletClass = foam.nanos.crunch.ui.CapableObjectWizardlet;
        }
        let wizardlet = wizardletClass.create({
          capability: capablePayload.capability,
          targetPayload: capablePayload,
          data$: capablePayload.data$
        }, capable);
        if ( capablePayload.data ) {
          wizardlet.data = capablePayload.data;
        }

        wizardlets.push(wizardlet);
      }

      this.wizardlets = wizardlets;
    }
  ]
});