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

  topics: [
    'finished'
  ],

  properties: [
    {
      name: 'data',
      hidden: true
    },
    {
      name: 'predicate',
      view: { class: 'foam.u2.view.ReciprocalSearch' }
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
      name: 'addEnabled',
      documentation: 'True to enable the Add button for adding to a relationship',
      value: false
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'topBorder',
      documentation: `Lets you put a view above the rest of the DAOController
        content.`
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rightBorder',
      documentation: `Lets you put a view to the right of the rest of the
        DAOController content.`
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'bottomBorder',
      documentation: `Lets you put a view below the rest of the DAOController
        content.`
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'leftBorder',
      documentation: `Lets you put a view to the left of the rest of the
        DAOController content.`
    }
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
      name: 'findRelatedObject',
      label: 'Add',
      isAvailable: function(relationship, addEnabled) {
        // Only enable the Add button if we're not already trying to choose a selected item for a relationship.
        return !! ( relationship && relationship.junctionDAO ) && ! addEnabled;
      },
      code: function() { }
    },
    {
      name: 'addSelection',
      label: 'Add',
      isAvailable: function(addEnabled) { return addEnabled; },
      code: function() {
        var self = this;
        this.relationship.add(this.selection).then(function() {
          self.finished.pub();
        });
      }
    },
    {
      name: 'select',
      isAvailable: function(selectEnabled) { return selectEnabled; },
      isEnabled: function(selection) { return !! selection; },
      code: function() {
        this.pub('select', this.selection.id);
        this.finished.pub();
      }
    }
  ]
});
