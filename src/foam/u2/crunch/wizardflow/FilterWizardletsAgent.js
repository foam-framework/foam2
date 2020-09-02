/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'FilterWizardletsAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  imports: [
    'crunchService',
    'ctrl',
    'unfilteredWizardlets'
  ],

  exports: [
    'wizardlets'
  ],

  properties: [
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet',
      factory: () => { return []; }
    }
  ],

  messages: [
    { name: 'CANNOT_OPEN_GRANTED', message: 'This capability has already been granted to you.' },
    { name: 'CANNOT_OPEN_PENDING', message: 'This capability is awaiting approval, updates are not permitted at this time.' },
    { name: 'CANNOT_OPEN_ACTION_PENDING', message: 'This capability is awaiting review, updates are not permitted at this time.' }
  ],

  methods: [
    async function execute() {
      for ( var i = 0; i < this.unfilteredWizardlets.length; i++ ) {
        var wizardlet = this.unfilteredWizardlets[i];
        var shouldReopen = await this.crunchService.maybeReopen(this.ctrl.__subContext__, wizardlet.capability.id);
        if ( shouldReopen ) this.wizardlets.push(wizardlet);
      }
    }
  ]
});

