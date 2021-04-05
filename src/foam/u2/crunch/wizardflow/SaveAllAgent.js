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
      let allValid = true;
      let topLevelUCJ;
      await foam.Promise.inOrder(this.wizardlets, async w => {
        if ( allValid ) {
          allValid = w.isValid;
        }
        var ucj = await w.save();
        if ( ucj && ucj.targetId == this.rootCapability.id ) topLevelUCJ = ucj;
      });
      if ( this.onSave ) {
        await this.onSave(allValid, topLevelUCJ);
      }
    }
  ]
});
