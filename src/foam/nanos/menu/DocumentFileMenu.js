/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DocumentFileMenu',
  extends: 'foam.nanos.menu.AbstractMenu',
  requires: [
    'foam.nanos.doc.DocumentationView'
  ],

  documentation: 'A menu item which contains a document fetched from the DocumentDAO',


  properties: [
    {
      class: 'String',
      name: 'docKey'
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'documentDAO'
    }
  ],

  methods: [
    function createView(X) {
      return this.DocumentationView.create({ id: this.docKey, daoKey: this.daoKey });
    }
  ]
});
