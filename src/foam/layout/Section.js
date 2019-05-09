/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.layout',
  name: 'Section',
  requires: [
    'foam.core.Action',
    'foam.core.Property'
  ],
  properties: [
    {
      class: 'Function',
      name: 'isAvailable',
      value: function() { return true; }
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class:  'FObjectArray',
      of: 'foam.core.Property',
      name: 'properties'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actions'
    }
  ],
  methods: [
    function fromSectionAxiom(a, cls) {
      this.copyFrom({
        isAvailable: a.isAvailable,
        order: a.order,
        title: a.title,
        properties: cls.getAxiomsByClass(this.Property)
          .filter(p => p.section == a.name)
          .filter(p => ! p.hidden),
        actions: cls.getAxiomsByClass(this.Action)
          .filter(a => a.section == a.name)
      });
      return this;
    }
  ]
}); 