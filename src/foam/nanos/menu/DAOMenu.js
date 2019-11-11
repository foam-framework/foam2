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
      name: 'title'
    },
    {
      class: 'String',
      name: 'subtitle'
    },
    {
      class: 'String',
      name: 'customDAOController',
      displayWidth: 80
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      type: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) {
        return value;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'createControllerView',
      type: 'foam.lib.json.UnknownFObject',
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
      type: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) {
        return value;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'detailView',
      displayWidth: 80
    },
    {
      class: 'String',
      name: 'createLabel',
      documentation: 'Set this to override the create button label.'
    },
    {
      class: 'Enum',
      of: 'foam.comics.SearchMode',
      name: 'searchMode',
      documentation: `
        The level of search capabilities that the controller should have.
      `
    },
    {
      class: 'Boolean',
      name: 'createEnabled',
      documentation: 'True to enable the create button.',
      value: true
    },
    {
      class: 'Boolean',
      name: 'editEnabled',
      documentation: 'True to enable the edit button.',
      value: true
    },
    {
      class: 'Boolean',
      name: 'selectEnabled',
      documentation: 'True to enable the select button.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'exportEnabled',
      documentation: 'True to enable the export button.',
      value: true
    },
    {
      class: 'Boolean',
      name: 'exportCSVEnabled',
      documentation: 'True to enable the export as CSV button',
      value: false
    },
    {
      class: 'Boolean',
      name: 'toggleEnabled',
      documentation: 'True to enable the toggle filters button.',
      value: true
    }
  ],

  methods: [
    function createView(X) {
      if ( ! this.customDAOController && ! X[this.daoKey] ) {
        throw new Error('No DAO found for ' + this.daoKey);
      }

      var view = {
        class: 'foam.comics.BrowserView',
        data: X[this.daoKey],
        createEnabled: this.createEnabled,
        detailView: this.detailView,
        editEnabled: this.editEnabled,
        exportEnabled: this.exportEnabled,
        exportCSVEnabled: this.exportCSVEnabled,
        selectEnabled: this.selectEnabled,
        toggleEnabled: this.toggleEnabled
      };

      if ( this.summaryView )          view.summaryView          = this.summaryView;
      if ( this.createControllerView ) view.createControllerView = this.createControllerView;
      if ( this.updateView )           view.updateView           = this.updateView;
      if ( this.title )                view.title                = this.title;
      if ( this.subtitle )             view.subtitle             = this.subtitle;
      if ( this.customDAOController )  view.customDAOController  = this.customDAOController;
      if ( this.createLabel )          view.createLabel          = this.createLabel;
      if ( this.searchMode )           view.searchMode           = this.searchMode;

      return view;
    }
  ]
});
