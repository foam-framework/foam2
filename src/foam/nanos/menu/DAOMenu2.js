/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DAOMenu2',
  extends: 'foam.nanos.menu.AbstractMenu',

  documentation: `
    A DAOMenu which can accept a DAOControllerConfig and uses
    the v2 DAOController
  `,

  requires: [
    'foam.comics.v2.DAOControllerConfig'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create();
      }
    }
  ],

  methods: [
    function createView(X) {
      return {
        class: 'foam.comics.v2.DAOBrowseControllerView',
        data: this.config.dao,
        config: this.config
      };
    }
  ]
});
