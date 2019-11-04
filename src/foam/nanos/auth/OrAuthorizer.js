/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'OrAuthorizer',
  flags: ['java'],

  documentation: `
    An implementation of the Authorizer interface that returns if any of its
    child Authorizers don't throw. If all children throw, then this Authorizer
    throws the exception that was thrown by its last child.

    It works like an OR operation because it passes (returns without throwing)
    if any of its children pass. It only fails when all of its children fail.
  `,

  implements: [
    'foam.nanos.auth.Authorizer'
  ],

  javaImports: [
    'java.util.function.Consumer',
    'java.util.function.Predicate'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.Authorizer',
      name: 'children'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `helperOne((authorizer) -> authorizer.authorizeOnCreate(x, obj));`
    },
    {
      name: 'authorizeOnRead',
      javaCode: `helperOne((authorizer) -> authorizer.authorizeOnRead(x, obj));`
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `helperOne((authorizer) -> authorizer.authorizeOnUpdate(x, oldObj, newObj));`
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `helperOne((authorizer) -> authorizer.authorizeOnDelete(x, obj));`
    },
    {
      name: 'checkGlobalRead',
      javaCode: `return helperTwo((authorizer) -> authorizer.checkGlobalRead(x));`
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `return helperTwo((authorizer) -> authorizer.checkGlobalRemove(x));`
    },
    {
      name: 'getPermissionPrefix',
      javaCode: `return "";`
    },
    {
      name: 'helperOne',
      args: [
        { name: 'fn', type: 'Consumer<Authorizer>' }
      ],
      javaCode: `
        AuthorizationException exception = null;

        for ( Authorizer child : getChildren() ) {
          try {
            fn.accept(child);
            return;
          } catch (AuthorizationException ae) {
            exception = ae;
          }
        }

        if ( exception == null ) return;

        throw exception;
      `
    },
    {
      name: 'helperTwo',
      type: 'Boolean',
      args: [
        { name: 'fn', type: 'Predicate<Authorizer>' }
      ],
      javaCode: `
        for ( Authorizer child : getChildren() ) {
          if ( fn.test(child) ) return true;
        }

        return false;
      `
    }
  ]
});
