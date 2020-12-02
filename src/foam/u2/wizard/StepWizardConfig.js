/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardConfig',

  implements: [
    'foam.core.ContextAware'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'allowSkipping',
      value: true
    },
    {
      class: 'Boolean',
      name: 'allowBacktracking',
      value: true
    }
  ],

  methods: [
    async function execute(){
      return;
    }
  ]
});
