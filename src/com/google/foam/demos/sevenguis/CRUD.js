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
  package: 'foam.demos.sevenguis',
  name: 'Person',

  tableProperties: [ 'id', 'surname', 'name' ],

  properties: [
    { name: 'id', hidden: true },
    { name: 'name',    toPropertyE: function(X) { return X.lookup('foam.u2.TextField').create({onKey: true}, X); } },
    { name: 'surname', toPropertyE: function(X) { return X.lookup('foam.u2.TextField').create({onKey: true}, X); } }
  ]
});


foam.CLASS({
  package: 'foam.demos.sevenguis',
  name: 'CRUD',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.DetailView',
    'foam.u2.TableView',
    'foam.dao.EasyDAO',
    'foam.demos.sevenguis.Person'
  ],

  exports: [ 'as data' ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
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
      */}
    })
  ],

  properties: [
    {
      name: 'prefix',
      label: 'Filter prefix',
      postSet: function(_, prefix) {
        this.filteredDAO = this.dao.where(this.STARTS_WITH_IC(this.Person.SURNAME, prefix));
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      factory: function() {
          /*
        return foam.dao.MDAO.create({
          of: foam.demos.sevenguis.Person
        });
*/
        return foam.dao.EasyDAO.create({
          of: foam.demos.sevenguis.Person,
          daoType: 'MDAO',
          cache: false,
          seqNo: true
        });
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      // TODO: replace with foam.u2.TableView when available
      toPropertyE: function(X) {
        return X.lookup('foam.u2.TableView').create({
          of: foam.demos.sevenguis.Person,
          title: '',
          scrollEnabed: true,
          editColumns: false
        });
      },
      factory: function() { return this.dao; }
    },
    {
      name: 'selection',
      postSet: function(_, s) { this.data.copyFrom(s); }
    },
    {
      name: 'person',
      toPropertyE: function(X) { return X.lookup('foam.u2.DetailView').create({of: foam.demos.sevenguis.Person}, X); },
//      toPropertyE: 'foam.u2.DetailView',
      factory: function() { return this.Person.create(); }
    }
  ],

  methods: [
    function initE() {
      this.nodeName = 'div';
      this.
          cssClass(this.myCls()).
          start('span').cssClass('prefix', 'label').add('Filter prefix: ').end().
          start(this.PREFIX, {onKey: true, type: 'search'}).end().
          start('div').cssClass('content').
            start('span').cssClass('summaryPane').
              start(this.FILTERED_DAO, {hardSelection$: this.selection$}).end().
            end().
            start('span').cssClass('detailPane').
              add(this.PERSON).
              start('div').cssClass('buttons').
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
