/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DAOMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  documentation: 'Menu for displaying standard DAO controller.',

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'String',
      name: 'customDAOController'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'subtitle'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      javaType: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) {
        return value;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'updateView',
      javaType: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) {
        return value;
      }
    }
  ],

  methods: [
    function createView(X) {
      if ( ! this.customDAOController && ! X[this.daoKey] ) {
        throw new Error('No DAO found for ' + this.daoKey);
      }

      var view = {
        class: 'foam.comics.BrowserView',
        data: X[this.daoKey]
      };

      if ( this.summaryView ) view.summaryView = this.summaryView;
      if ( this.updateView ) view.updateView = this.updateView;
      if ( this.title ) view.title = this.title;
      if ( this.subtitle ) view.subtitle = this.subtitle;
      if ( this.customDAOController ) view.customDAOController = this.customDAOController;

      return view;
    }
  ]
});
