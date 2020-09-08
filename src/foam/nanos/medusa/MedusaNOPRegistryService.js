/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaNOPRegistryService',
  extends: 'foam.nanos.medusa.MedusaRegistryService',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X'
  ],

  methods: [
    {
      name: 'latch',
      javaCode: `
      return null;
      `
    },
    {
      name: 'wait',
      javaCode: `
      return null;
      `
    },
    {
      name: 'notify',
      javaCode: `
      // nop
      `
    },
    {
      name: 'count',
      javaCode: `
      return 0L;
      `
    }
  ]
});
