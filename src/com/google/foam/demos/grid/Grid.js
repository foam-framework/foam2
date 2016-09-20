/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'com.google.foam.demos.grid',
  name: 'Resource',

  tableProperties: [ 'description', 'url' ],

  properties: [
    { name: 'id', hidden: true },
    { name: 'description' },
    { name: 'url', label: 'URL' }
  ]
});


foam.CLASS({
  package: 'com.google.foam.demos.grid',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.u2.DetailView',
    'foam.u2.TableView',
    'foam.dao.EasyDAO',
    'com.google.foam.demos.grid.Resource'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
      */}
    })
  ],

  properties: [
    {
      name: 'dao',
      view: { class: 'foam.u2.TableView', of: com.google.foam.demos.grid.Resource },
      factory: function() {
        return foam.dao.EasyDAO.create({
          of: foam.demos.sevenguis.Person,
          daoType: 'MDAO',
          seqNo: true
        });
      }
    },
    {
      name: 'person',
      view: 'foam.u2.DetailView',
      factory: function() { return this.Resource.create(); }
    }
  ],

  methods: [
    function initE() {
      this.
        cssClass(this.myCls()).
        start('h1').add('Add Resources').end().
        add(this.PERSON, this.ADD_RESOURCE).
        start('h1').add('List of Resources').end().
        add(this.DAO, this.SHOW);
    }
  ],

  actions: [
    {
      name: 'addResource',
      label: 'Add',
      code: function() {
        var p = this.person;
        this.dao.put(p.clone());
        p.id = p.description = p.url = undefined;
      }
    },
    {
      name: 'show',
      code: function() {
        console.log('show');
        this.dao.select().then(function(s) {
          window.alert(foam.json.Outputer.create({
            pretty: false,
            outputClassNames: false
          }).stringify(s.a));
        });
      }
    },
    {
      name: 'deleteItem',
      label: 'Delete',
      code: function() {
      }
    }
  ]
});

// Didn't specify view for dao
// Didn't specify 'of' for TableView
// Invalid names in tableProperties:
// added invalid action name, no error
// clone on DAO.put
