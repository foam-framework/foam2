/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'CitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'summary'
    }
  ],

  reactions: [
    ['', 'propertyChange.data', 'updateSummary'],
    ['data', 'propertyChange', 'updateSummary']
  ],

  listeners: [
    {
      name: 'updateSummary',
      isFramed: true,
      code: function() {
        this.summary = this.data ? this.data.toSummary() : undefined;
      }
    }
  ],

  methods: [
   function initE() {
      this.SUPER();
      this.add(this.summary$);
    }
  ]
});
