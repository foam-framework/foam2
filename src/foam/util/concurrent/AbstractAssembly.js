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
      name: 'isCompleted',
      class: 'Boolean',
      synchronized: true,
      value: false,
      documentation: 'True once endJob() has executed.'
    }
  ],

  methods: [
    {
      name: 'requestLocks',
      javaCode: `
        // Template method, override in subclass if desired
        return null;
      `
    },
    {
      name: 'executeUnderLock',
      javaCode: `
        // Template method, override in subclass if desired
      `
    },
    {
      name: 'startJob',
      javaCode: `
        // Template method, override in subclass if desired
      `
    },
    {
      name: 'executeJob',
      javaCode: `
        // Template method, override in subclass if desired
      `
    },
    {
      name: 'endJob',
      args: [ 'boolean isLast' ],
      javaCode: `
        // Template method, override in subclass if desired
      `
    },
    {
      name: 'complete',
      synchronized: true,
      javaCode: `
         setIsCompleted(true);
         notify();
      `
    },
    {
      name: 'waitToComplete',
      synchronized: true,
      javaCode: `
         while ( ! getIsCompleted() ) {
           try {
             wait();
           } catch (InterruptedException e) {
             // NOP
             Thread.currentThread().interrupt();
           }
         }
      `
    }
  ]
});
