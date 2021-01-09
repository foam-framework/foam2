/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'DashboardCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  requires: [
    'foam.comics.v2.DAOControllerConfig'
  ],

  imports: [
    'stack'
  ],

  exports: [
    'as rowView'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .on('click', function() {
          self.openFilteredListView(self.data);
        })
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('id'))
          .add(this.data['id'])
        .end()
        .start()
          .addClass(this.myClass('value'))
          .add(this.data['value'])
        .end()
    },

    function openFilteredListView(obj) {
      var dao = this.__subContext__[obj.listDAOName].where(this.EQ(obj.searchKey, obj.id));
      var config = this.DAOControllerConfig.create({ dao: dao, hideQueryBar: false });
      this.stack.push({
        class: 'foam.comics.v2.DAOBrowserView',
        config: config
      });
    }
  ],

  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      padding-top: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e4e3e3;
    }

    ^id {
      font-weight: 300;
      font-size: 13px;
      color: gray;
    }

    ^value {
      font-size: 13px;
      font-weight: 500;
    }
  `
});
