/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'DetachAgent',
  flags: ['web'],
  documentation: `
    todo.
  `,

  imports: [
    'wizardCloseSub'
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {
      this.wizardCloseSub.detach();
    }
  ]
});