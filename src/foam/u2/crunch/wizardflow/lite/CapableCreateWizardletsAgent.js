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

  requires: [
    'foam.nanos.crunch.MinMaxCapability'
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
      var capable = this.capable;
      var wizardletsTuple = this.createWizardletsFromPayloads(capable.capablePayloads);
      this.wizardlets = wizardletsTuple.allDescendantWizardlets;
      console.log('CAPABLE', capable);
      console.log('WIZARDLETS', this.wizardlets);
    },
    function createWizardletsFromPayloads(payloads) {
      var newWizardlets = [];
      var childWizardlets = [];
      for ( let i = 0 ; i < payloads.length ; i++ ) {
        let capablePayload = payloads[i];
        let wizardlet = this.createWizardletFromPayload(capablePayload);
        let handlePrereqsNormally = true;
        let addWizardletAtEnd = true;

        // If this is a MinMax capability, handle its prerequisites differently
        if ( this.MinMaxCapability.isInstance(capablePayload.capability) ) {
          handlePrereqsNormally = false;
          addWizardletAtEnd = false;

          // MinMax wizardlets appear before their prerequisites
          newWizardlets.push(wizardlet);
          childWizardlets.push(wizardlet);
          
          let minMaxPrereqWizardlets =
            this.createWizardletsFromPayloads(capablePayload.prerequisites);
          minMaxPrereqWizardlets.directChildrenWizardlets.forEach(prereqWizardlet => {
            prereqWizardlet.isAvailable = false;
            wizardlet.choiceWizardlets.push(prereqWizardlet);
          })

          newWizardlets = [
            ...newWizardlets,
            ...minMaxPrereqWizardlets.allDescendantWizardlets
          ]
        }

        // If this is a prerequisite of a normal capability, bind isAvailable to the
        // parent.
        if ( handlePrereqsNormally && capablePayload.prerequisites.length > 0 ) {
          let prereqWizardlets =
            this.createWizardletsFromPayloads(capablePayload.prerequisites);
          prereqWizardlets.directChildrenWizardlets.forEach(prereqWizardlet => {
            prereqWizardlet.isAvailable$.follow(wizardlet.isAvailable$);
          })

          newWizardlets = [
            ...newWizardlets,
            ...prereqWizardlets.allDescendantWizardlets
          ]
        }

        // Wizardlets appear after their prerequisites by default
        if ( addWizardletAtEnd ) {
          newWizardlets.push(wizardlet);
          childWizardlets.push(wizardlet);
        }
      }

      return {
        allDescendantWizardlets: newWizardlets,
        directChildrenWizardlets: childWizardlets
      };
    },
    function createWizardletFromPayload(capablePayload) {
      let wizardletClass = capablePayload.capability.wizardlet.cls_;

      // Override the default wizardlet class with one that does not
      //   save to userCapabilityJunction
      if ( wizardletClass.id == 'foam.nanos.crunch.ui.CapabilityWizardlet' ) {
        wizardletClass = foam.nanos.crunch.ui.CapableObjectWizardlet;
      }
      if ( wizardletClass.id == 'foam.nanos.crunch.ui.MinMaxCapabilityWizardlet' ) {
        wizardletClass = foam.nanos.crunch.ui.CapableMinMaxCapabilityWizardlet;
      }

      let wizardlet = wizardletClass.create({
        capability: capablePayload.capability,
        targetPayload: capablePayload,
        data$: capablePayload.data$
      }, this);

      return wizardlet;
    },
  ]
});