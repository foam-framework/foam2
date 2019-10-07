/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  name: 'DAOController',

  requires: [
    'foam.comics.SearchMode',
    'foam.u2.borders.NullBorder',
    'foam.nanos.export.CSVDriver'
  ],

  topics: [
    'finished'
  ],

  exports: [
    'filteredTableColumns',
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'filteredTableColumns'
    },
    {
      name: 'data',
      hidden: true
    },
    {
      name: 'predicate'
    },
    {
      name: 'csvDriver',
      factory: function() {
        return this.CSVDriver.create();
      }
    },
    {
      name: 'filteredDAO',
      view: { class: 'foam.u2.view.ScrollTableView' },
      expression: function(data, predicate) {
        return predicate ? data.where(predicate) : data;
      }
    },
    {
      name: 'relationship'
    },
    {
      name: 'selection',
      hidden: true
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
      documentation: 'True to enable the edit button',
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
      documentation: 'True to enable export csv button'
    },
    {
      class: 'Boolean',
      name: 'toggleEnabled',
      documentation: 'True to enable the toggle filters button.',
      value: true
    },
    {
      name: 'border',
      documentation: `
        If you want the DAO controller to be the content of a border view, set
        the border here.
      `,
      factory: function() { return this.NullBorder.create(); }
    },
    {
      class: 'Boolean',
      name: 'searchHidden',
      documentation: `Used internally to keep track of whether the search panel
        is currently hidden or not.`,
      value: false
    },
    {
      class: 'Enum',
      of: 'foam.comics.SearchMode',
      name: 'searchMode',
      documentation: `
        The level of search capabilities that the controller should have.
      `,
      factory: function() {
        return this.SearchMode.FULL;
      }
    },
    {
      name: 'searchColumns',
      documentation: `
        Lets you pick which properties on the model should be used as search
        filters. You should set the search columns on the model itself and only
        set this property when you want to override the ones set on the model.
      `
    },
    {
      class: 'String',
      name: 'title',
      expression: function(data$of) {
        return data$of.model_.plural;
      }
    },
    {
      class: 'String',
      name: 'subtitle'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'primaryAction',
      documentation: `
        The most important action on the page. The view for this controller may
        choose to display this action prominently.
      `,
      factory: function() {
        return this.relationship
          ? this.SELECT
          : this.cls_.CREATE;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      documentation: `
        Subclasses can set this to override the default summaryView.
      `
    },
    {
      class: 'String',
      name: 'createLabel',
      documentation: `
        Set this to override the label of the create button, which is the
        default primary action.
      `
    },
    {
      class: 'String',
      name: 'detailView',
      value: 'foam.u2.DetailView'
    },
    'selectedObjects'
  ],

  actions: [
    {
      name: 'create',
      isAvailable: function(createEnabled) { return createEnabled; },
      code: function() { }
    },
    {
      name: 'edit',
      isEnabled: function(selection) { return !! selection; },
      isAvailable: function(editEnabled) { return editEnabled; },
      code: function() {
        this.pub('edit', this.selection.id);
      }
    },
    {
      name: 'select',
      isAvailable: function(selectEnabled) { return selectEnabled; },
      isEnabled: function(selection, selectedObjects) {
        return this.relationship ? !! selectedObjects : !! selection;
      },
      code: function() {
        this.pub('select', this.relationship ? this.selectedObjects : this.selection.id);
        this.finished.pub();
      }
    },
    {
      name: 'export',
      isAvailable: function(exportEnabled) { return exportEnabled; },
      code: function() {
        this.pub('export', this.filteredDAO);
      }
    },
    {
      name: 'exportCSV',
      label: 'Export as CSV',
      icon: 'images/export-icon-resting.svg',
      isAvailable: function(exportCSVEnabled) { return exportCSVEnabled; },
      code: function(x) {
        this.downloadCSV(x, this.filteredDAO);
      }
    }
  ],

  listeners: [
    function downloadCSV(x, data) {
      this.csvDriver.exportDAO(x, data)
        .then(function(result) {
          result = 'data:text/csv;charset=utf-8,' + result;
          var encodedUri = encodeURI(result);
          var link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'data.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    }
  ]
});
