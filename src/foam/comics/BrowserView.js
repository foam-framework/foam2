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
      name: 'addEnabled',
      documentation: `
        True to enable the Add button for adding to a relationship.
      `
    },
    {
      class: 'Boolean',
      name: 'exportEnabled',
      documentation: 'True to enable the export button.'
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
        addEnabled,
        exportEnabled
      ) {
        var config = { data: data };

        if ( title ) config.title = title;
        if ( subtitle ) config.subtitle = subtitle;
        if ( createLabel ) config.createLabel = createLabel;
        if ( searchMode ) config.searchMode = searchMode;
        config.createEnabled = createEnabled;
        config.editEnabled = editEnabled;
        config.selectEnabled = selectEnabled;
        config.addEnabled = addEnabled;
        config.exportEnabled = exportEnabled;

        if ( customDAOController ) {
          return this.__context__.lookup(customDAOController).create(config);
        }
        return this.DAOController.create(config);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    },
    'updateView'
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
