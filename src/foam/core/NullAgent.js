/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'NullAgent',
  documentation: `
    An Agent that has an empty execution.
  `,

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {}
  ]
});
  