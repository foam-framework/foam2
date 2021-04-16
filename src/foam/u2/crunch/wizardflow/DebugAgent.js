/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'DebugAgent',
  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'wizardlets'
  ],

  requires: [
    'foam.u2.wizard.ProxyWAO',
    'foam.u2.wizard.WizardletSection',
    'foam.u2.wizard.debug.DebugContextIntercept',
    'foam.u2.wizard.debug.DebugWAO'
  ],

  methods: [
    async function execute() {
      for ( let wizardlet of this.wizardlets ) {
        var ctxIntercept = this.DebugContextIntercept.create();
        wizardlet.pushContext(ctxIntercept.createInterceptedValues(
          wizardlet.__subSubContext__
        ));
        if ( wizardlet.of ) {
          wizardlet.sections.push(this.WizardletSection.create({
            wizardlet: wizardlet,
            title: 'Developer Tools',
            isAvailable: true,
            isValid: true,
            customView: {
              class: 'foam.u2.wizard.debug.DebugWizardletView',
              wizardlet: wizardlet
            }
          }));
        }
        if ( ! this.ProxyWAO.isInstance(wizardlet.wao) ) continue;
        wizardlet.wao = this.DebugWAO.create({ delegate: wizardlet.wao });
      }
      console.log('DebugAgent is ON');
    }
  ]
});
