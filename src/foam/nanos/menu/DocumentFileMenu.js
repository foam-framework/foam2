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
      class: 'Reference',
      of: 'foam.flow.Document',
      name: 'docKey',
      label: 'Document',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ReferenceView',
          dao$: X.data$.dot('daoKey').map(function(key) {
            return X[key] || foam.dao.NullDAO.create();
          })
        };
      }
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'documentDAO'
    },
    {
      class: 'String',
      name: 'anchor'
    }
  ],

  methods: [
    function createView(X) {
      return this.DocumentationView.create({ docKey: this.docKey, daoKey: this.daoKey, anchor: this.anchor });
    }
  ]
});
