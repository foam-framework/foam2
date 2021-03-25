/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'NullAgent',
  documentation: `
    Empty agent used to replace existing agents when removing from the sequence.
  `,

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {}
  ]
});
  