/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'ContextAwareSupport',

  implements: [
    'foam.core.ContextAware'
  ],

  properties: [
    {
      class: 'Object',
      name: 'x',
      javaType: 'foam.core.X',
      javaFactory: `
        return EmptyX.instance();
      `
    }
  ]
})
