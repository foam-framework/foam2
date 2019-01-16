/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'com.google.foam.demos.sevenguis',
  name: 'Person',

  documentation: 'Simple Person class.',

  tableColumns: [ 'id', 'surname', 'name' ],

  properties: [
    { name: 'id', hidden: true },
    { name: 'name',    view: { class: 'foam.u2.TextField', onKey: true } },
    { name: 'surname', view: { class: 'foam.u2.TextField', onKey: true } }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.sevenguis',
  name: 'CRUD',
  extends: 'foam.u2.Element',

  documentation: 'CRUD (Create Read Update Delete) Demo',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.DetailView',
    'foam.u2.TableView',
    'foam.dao.EasyDAO',
    'com.google.foam.demos.sevenguis.Person'
  ],

  exports: [ 'as data' ],

  css: `
    ^ { padding: 10px; }
    ^ .detailView { border: none; background: white; }
    ^ .content span { margin-top: 24px; overflow: hidden !important; }
    ^ .buttons { margin-top: 24px; }
    ^ .content { width: 1000px; }
    ^ .detailPane { width: 45%; display: inline-block; margin-left: 50px; margin-top: 16px; }
    ^ .label { color: #039; font-size: 14px; padding-top: 6px; }
    ^ .prefix { margin-left: 10px; }
    ^ .summaryPane { width: 49%; display: inline-block; vertical-align: top; }
    ^ .tableView { height: 184px; outline: none; }
  `,

  properties: [
    {
      class: 'String',
      name: 'prefix',
      label: 'Filter prefix'
    },
    {
      name: 'dao',
      factory: function() {
        return foam.dao.EasyDAO.create({
          of: com.google.foam.demos.sevenguis.Person,
          daoType: 'MDAO',
          seqNo: true
        });
      }
    },
    {
      name: 'filteredDAO',
      expression: function(dao, prefix) {
        return dao.where(this.STARTS_WITH_IC(this.Person.SURNAME, prefix));
      },
      view: {
        class: 'foam.u2.view.TableView',
        of: com.google.foam.demos.sevenguis.Person,
        title: '',
        editColumnsEnabled: false
      }
    },
    {
      name: 'selection',
      postSet: function(_, s) { this.person.copyFrom(s); }
    },
    {
      name: 'person',
      view: { class: 'foam.u2.DetailView' },
      factory: function() { return this.Person.create(); }
    }
  ],

  methods: [
    function initE() {
      this.nodeName = 'div';
      this.
          addClass(this.myClass()).
          start('span').addClass('prefix', 'label').add('Filter prefix: ').end().
          start(this.PREFIX, {onKey: true, type: 'search'}).end().
          start('div').addClass('content').
            start('span').addClass('summaryPane').
              start(this.FILTERED_DAO, {selection$: this.selection$}).end().
            end().
            start('span').addClass('detailPane').
              add(this.PERSON).
              start('div').addClass('buttons').
                add(this.CREATE_ITEM, this.UPDATE_ITEM, this.DELETE_ITEM).
              end().
            end().
          end();
    }
  ],

  actions: [
    {
      name: 'createItem',
      label: 'Create',
//      isEnabled: function(person) { return person.name && person.surname; },
      code: function() {
        var data = this.person.clone();
        data.id = undefined;
        this.dao.put(data).then(function(data) {
          this.person.copyFrom(data);
        }.bind(this));
      }
    },
    {
      name: 'updateItem',
      label: 'Update',
//      isEnabled: function(person) { return person.id; },
      code: function() {
        this.dao.put(this.person.clone());
      }
    },
    {
      name: 'deleteItem',
      label: 'Delete',
//      isEnabled: function(person) { return person.id; },
      code: function() {
        this.dao.remove(this.person).then(function() {
          // this.person.id = this.person.name = this.person.surname = '';
        }.bind(this));
      }
    }
  ]
});
