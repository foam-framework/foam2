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
      name: 'allowSkipping',
      class: 'Boolean',
      value: true
    },
    {
      name: 'allowBacktracking',
      class: 'Boolean',
      value: true
    },
    {
      name: 'allMustBeValid',
      class: 'Boolean'
    }
  ],

  methods: [
    async function execute(){
      return;
    }
  ]
});
