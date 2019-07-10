/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.comics',
  name: 'BrowserView',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.DAOController',
    'foam.comics.DAOControllerView'
  ],

  exports: [
    'controller as data',
    'summaryView',
    'createControllerView',
    'updateView'
  ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'title',
      expression: function(data$of) {
        return 'Browse ' + data$of.model_.plural;
      }
    },
    {
      class: 'String',
      name: 'subtitle'
    },
    {
      class: 'String',
      name: 'customDAOController'
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
      documentation: 'True to enable the create button.'
    },
    {
      class: 'Boolean',
      name: 'editEnabled',
      documentation: 'True to enable the edit button.'
    },
    {
      class: 'Boolean',
      name: 'selectEnabled',
      documentation: 'True to enable the select button.'
    },
    {
      class: 'Boolean',
      name: 'exportEnabled',
      documentation: 'True to enable the export button.'
    },
    {
      class: 'Boolean',
      name: 'exportCSVEnabled',
      documentation: 'True to enabled the export as CSV button'
    },
    {
      class: 'Boolean',
      name: 'toggleEnabled',
      documentation: 'True to enable the toggle filters button.'
    },
    {
      name: 'controller',
      expression: function(
        data,
        title,
        subtitle,
        customDAOController,
        createLabel,
        searchMode,
        createEnabled,
        editEnabled,
        selectEnabled,
        exportEnabled,
        exportCSVEnabled,
        toggleEnabled,
        detailView
      ) {
        var config = {};

        if ( createLabel ) config.createLabel = createLabel;
        if ( searchMode )  config.searchMode  = searchMode;
        if ( subtitle )    config.subtitle    = subtitle;
        if ( title )       config.title       = title;
        config.createEnabled = createEnabled;
        config.detailView    = detailView;
        config.editEnabled   = editEnabled;
        config.exportEnabled = exportEnabled;
        config.exportCSVEnabled = exportCSVEnabled;
        config.selectEnabled = selectEnabled;
        config.toggleEnabled = toggleEnabled;

        if ( customDAOController ) {
          var controller = this.__context__.lookup(customDAOController).create(config, this);

          // Let the custom controller override the dao used.
          controller.data = controller.data || data;

          return controller;
        }

        config.data = data;
        return this.DAOController.create(config, this);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    },
    // This is the DAOUpdateControllerView, not the DetailView
    'updateView',
    // This is the DAOCreateControllerView, not the DetailView
    'createControllerView',
    {
      class: 'String',
      name: 'detailView',
      value: 'foam.u2.DetailView'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .addClass(this.myClass(this.data.of.id.replace(/\./g, '-')))
        .tag(this.DAOControllerView);
    }
  ]
});
