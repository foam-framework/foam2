/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'RequirementsPreviewAgent',
  implements: [ 'foam.core.ContextAgent' ],
  documentation: `
    Display a preview of the capability. This gives the user an idea of what to
    expect before they proceed.
  `,

  imports: [
    'capabilities',
    'ctrl',
    'rootCapability',
    'sequence',
    'wizardlets'
  ],

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.dialog.Popup'
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    function execute() {
      var sectionsList = this.generateSections(this.wizardlets);
      const arrOfRequiredCapabilities = [];
      for ( let i = 0; i < sectionsList.length; i++ ) {
        for ( let j = 0; j < sectionsList[i].length; j++ ) {
          if ( sectionsList[i][j].help ) {
            if ( typeof sectionsList[i][j].help === 'function' ) {
              let curCap = this.wizardlets[i].capability;
              let generateHelpText = sectionsList[i][j].help.bind(curCap.of.create({}, this));
              sectionsList[i][j].help = generateHelpText(curCap);
            }
            arrOfRequiredCapabilities.push(sectionsList[i][j].help);
          }
        }
      }
      if ( arrOfRequiredCapabilities.length < 1 ) {
        // if nothing to show don't open this dialog - push directly to wizard
        return Promise.resolve();
      } else {
        return new Promise((resolve, _) => {
          this.ctrl.add(
            this.Popup.create({ closeable: false }, this.ctrl.__subContext__).tag({
              class: 'foam.u2.crunch.CapabilityRequirementView',
              arrayRequirement: arrOfRequiredCapabilities,
              functionData: { caps: this.capabilities },
              capabilityId: this.rootCapability.id,
              onClose: (x, isContinueAction) => {
                resolve(isContinueAction);
              }
            })
          ).end();
        }).then(isContinueAction => {
          if ( ! isContinueAction ) {
            this.sequence.endSequence();
            return Promise.resolve();
          }
        })
      }
    },

    function generateSections(generatedWizardlets) {
      return generatedWizardlets.map(wizardlet =>
        this.AbstractSectionedDetailView.create({
          of: wizardlet.of
        }).sections);
    }
  ]
});
