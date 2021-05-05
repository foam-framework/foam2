/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'LoadTopConfig',
  implements: [
    'foam.core.ContextAware'
  ],

  documentation: `
    Allows the top-level capability to configure the wizard and this sequence.
  `,

  imports: [
    'rootCapability',
    'sequence'
  ],

  methods: [
    async function execute() {
      if ( this.rootCapability.wizardConfig ) {
        await this.rootCapability.wizardConfig.clone(this).execute();
        this.rootCapability.wizardConfig.applyTo(this.sequence);
      }
    }
  ]
});
