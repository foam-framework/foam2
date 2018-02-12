/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DAOMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      javaType: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    }
  ],

  methods: [
    function createView(X) {
      if ( ! X[this.daoKey] ) {
        throw new Error("No dao found for " + this.daoKey);
      }

      var view = { class: 'foam.comics.BrowserView', data: X[this.daoKey] };

      if ( this.summaryView ) view.summaryView = this.summaryView;
      return view;
    }
  ]
});
