/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityCategory',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  documentation: `
    This models a category to which a Capability can be associated.
  `,

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Authorizer'
  ],

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'description',
      class: 'String',
      documentation: `Description of category`
    },
    {
      name: 'visible',
      class: 'Boolean',
      documentation: 'categories are being used for UI display and also predicate rules on UCJDAO',
      value: true
    },
    {
      name: 'visibilityCondition',
      class: 'foam.mlang.predicate.PredicateProperty',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'defaultAuthorizer',
      class: 'Object',
      flags: ['java'],
      javaType: 'foam.nanos.auth.Authorizer',
      javaFactory: `
        return new foam.nanos.auth.StandardAuthorizer(getClass().getSimpleName().toLowerCase());
      `,
      transient: true,
      readVisibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        ( getDefaultAuthorizer()).authorizeOnCreate(x, this);
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        if ( getVisibilityCondition() == null ) {
          return;
        }
        try {
          if ( getVisibilityCondition().f(x) ) return;
          throw new AuthorizationException();
        } catch ( AuthorizationException e ) {
          throw new AuthorizationException("You do not have permission to view this capabilitycategory");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        ( getDefaultAuthorizer()).authorizeOnUpdate(x, oldObj, this);
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        ( getDefaultAuthorizer()).authorizeOnDelete(x, this);
      `
    }
  ]
});

foam.RELATIONSHIP({
  package: 'foam.nanos.crunch',
  sourceModel: 'foam.nanos.crunch.CapabilityCategory',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'capabilities',
  inverseName: 'categories'
});
