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
    },
    {
      class: 'String',
      name: 'label',
      expression: function(title) {
        return foam.String.capitalize(title);
      }
    },
    {
      class: 'Int',
      name: 'order',
      value: Number.MAX_VALUE,  // if no order is specified
    },
    {
      class: 'Function',
      name: 'isAvailable',
      value: function() { return true; }
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
