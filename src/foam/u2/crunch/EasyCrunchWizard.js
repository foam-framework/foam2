/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'EasyCrunchWizard',
  requires: [
    'foam.u2.crunch.wizardflow.SkipGrantedAgent',
    'foam.u2.crunch.wizardflow.SkipMode',
    'foam.u2.wizard.StepWizardConfig'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'allowSkipping'
    },
    {
      class: 'Boolean',
      name: 'allowBacktracking',
      value: true
    },
    {
      name: 'skipMode',
      class: 'Enum',
      of: 'foam.u2.crunch.wizardflow.SkipMode',
      factory: function () {
        return this.SkipMode.SKIP;
      }
    },
    {
      name: 'incrementalWizard',
      class: 'Boolean'
    }
  ],

  methods: [
    function applyTo(sequence) {
      var config = this.StepWizardConfig.create({
        allowSkipping: this.allowSkipping,
        allowBacktracking: this.allowBacktracking,
        ...(this.incrementalWizard ? {
          wizardView: { class: 'foam.u2.wizard.IncrementalStepWizardView' }
        } : {})
      });
      sequence.reconfigure('StepWizardAgent', { config: config });
      if ( this.skipMode )
        sequence.reconfigure('SkipGrantedAgent', {
          mode: this.skipMode });
      if ( this.statelessWizard )
        sequence.remove('WizardStateAgent');
    },
    async function execute () {
      // Subclasses which fetch information asynchronously can override this
    }
  ]
});
