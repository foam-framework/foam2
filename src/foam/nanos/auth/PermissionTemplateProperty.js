/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTemplateProperty',

  documentation: `
    Referenced in permission template references. Describes property permission segments
    in generated permission strings within configurable authorizer.
  `,

  properties: [
    {
      class: 'String',
      name: 'propertyReference',
      documentation: `
        References property to get value from object attempting to be
        accessed by configurable authorizer.
      `
    },
    {
      class: 'Boolean',
      name: 'impliesValue',
      documentation: `
        Implies value on permission generated in configurable authorizer.
        When true, permission string segment generated will hold reference to
        the property name and value.
      `
    },
    {
      class: 'Boolean',
      name: 'impliesRange',
      documentation: `
        TODO: Implies that permission segment generated should reference number values
        along with comparison operators to distinguish whether object satisfies condition
        implied in segment.
      `
    }
  ]
});
