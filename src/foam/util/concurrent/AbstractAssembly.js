/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.concurrent',
  name: 'AbstractAssembly',
  //abstract: true,
  // TODO?: Could provide a reset() method if wanted to make reusable to avoid GC.

  /**
   * Abstract implementation of Assembly interface.
   * Provides concurrency support.
   **/

  implements: [
    'foam.util.concurrent.Assembly'
  ],

  properties: [
    {
      name: 'complete',
      type: 'Boolean',
      value: false,
      documentation: 'True once endJob() has executed.'
    },
    {
      name: 'isLast',
      type: 'Boolean',
      value: true,
      documentation: 'True if no new Assembly is waiting for this task to complete.'
    },
  ],

  methods: [
    {
      name: 'startJob'
      // Template method, override in subclass if desired
    },
    {
      name: 'executeJob'
      // Template method, override in subclass if desired
    },
    {
      name: 'endJob'
      // Template method, override in subclass if desired
    },
    {
      name: 'isLast',
      type: 'boolean',
      synchronized: true,
      javaCode: `
        return getIsLast();
      `,
    },
    {
      name: 'complete',
      synchronized: true,
      javaCode: `
         setComplete(true);
         notify();
      `
    },
    {
      name: 'waitToComplete',
      synchronized: true,
      javaCode: `
         while ( ! getComplete() ) {
           try {
             wait();
           } catch (InterruptedException e) {
             // NOP
           }
         }
      `
    }
  ]

})
