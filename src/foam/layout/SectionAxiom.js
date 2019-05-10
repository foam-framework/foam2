/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.layout',
  name: 'SectionAxiom',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'title',
      expression: function(name) {
        return foam.String.capitalize(name);
      }
    },
    {
      class: 'String',
      name: 'help'
    },
    {
      class: 'Int',
      name: 'order',
      value: Number.MAX_VALUE
    },
    {
      class: 'Boolean',
      name: 'permissionRequired'
    },
    {
      class: 'Function',
      name: 'isAvailable',
      value: function() { return true; }
    }
  ],
  methods: [
    function createIsAvailableFor(data$) {
      // TODO: permission check.
      return foam.core.ExpressionSlot.create({
        obj$: data$,
        code: this.isAvailable
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.layout',
  name: 'PropertySectionRefine',
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'String',
      name: 'section'
    }
  ]
});

foam.CLASS({
  package: 'foam.layout',
  name: 'ActionSectionRefine',
  refines: 'foam.core.Action',
  properties: [
    {
      class: 'String',
      name: 'section'
    }
  ]
});

foam.CLASS({
  package: 'foam.layout',
  name: 'ModelSectionRefine',
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'foam.layout.SectionAxiom',
      name: 'sections'
    }
  ]
});
