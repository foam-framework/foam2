/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'ContextAware',
  methods: [
    {
      name: 'getX',
      type: 'Context'
    },
    {
      name: 'setX',
      type: 'Void',
      args: [ { name: 'x', type: 'Context' } ]
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(`
          static <T> T maybeContextualize(X x, T obj) {
            if ( obj instanceof ContextAware ) {
              ((ContextAware) obj).setX(x);
            }
            return obj;
          }
        `);
      }
    }
  ]
});
