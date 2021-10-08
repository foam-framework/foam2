/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTemplateProperty',

  documentation: `
    Can be applied in PermissionTemplateReference. Describes property permission segments
    in generated permission strings when applied within a configurable authorizer.

    Please read documentation on impliesValue property for important configuration information.
  `,

  properties: [
    {
      class: 'String',
      name: 'propertyReference',
      documentation: `
        References property to get a value from object attempting to be
        accessed by a configurable authorizer.
      `
    },
    {
      class: 'Boolean',
      name: 'impliesValue',
      value: true,
      documentation: `
        Implies value on permission generated in configurable authorizer.
        When true, permission string segment generated will hold reference to
        a property name and value.

        (E.g.
          crayondao.read.color[blue] when true,
          crayondao.read.blue when false)

        Setting this to false may create conflicts and undesired authorization when building templates
        that reference similar property values.

        (e.g housedao.read.interiorColor[green], housedao.read.exteriorColor[blue] )
        This would work fine with impliesValue set to true, however if false these values would conflict
        (e.g housedao.read.green, housedao.read.blue)
        The Authorizer and users permission list would not know how to distinguish which property to compare to
        and would permit the user to view all houses that are both green and blue exteriors and interiors.
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
