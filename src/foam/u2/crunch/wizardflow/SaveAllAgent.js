/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'SaveAllAgent',
  flags: ['web'],
  documentation: `
    Currently used by CapableView to pre-save junctions for immediate
    invalidation of the model. This agent saves wizardlets in order.
  `,

  imports: [
    'wizardlets',
    'rootCapability'
  ],

  properties: [
    {
      class: 'Function',
      name: 'onSave'
    }
  ],

  methods: [
    async function execute() {
      let state = {
        allValid: true,
        topLevelUCJ: null
      };
      await this.save(state);
      if ( this.onSave ) {
        await this.onSave(state.allValid, state.topLevelUCJ);
      }
    },
    async function save(state) {
      try {
        await foam.Promise.inOrder(this.wizardlets, async w => {
          if ( state.allValid ) state.allValid = w.isValid;
          var ucj = await w.save();
          if ( ucj && ucj.targetId == this.rootCapability.id ) state.topLevelUCJ = ucj;
        });
      } catch (e) {
        console.error(e);
        await new Promise(resolve => {
          setTimeout(async () => {
            await this.save(state);
            resolve();
          }, 5000);
        });
      }
    }
  ]
});
