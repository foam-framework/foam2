/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'SaveAllAgent',
  documentation: `
    Currently used by CapableView to pre-save junctions for immediate
    invalidation of the model. This agent saves wizardlets in order.
  `,

  imports: [
    'wizardlets'
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {
      await foam.Promise.inOrder(this.wizardlets, w => w.save());
    }
  ]
});
