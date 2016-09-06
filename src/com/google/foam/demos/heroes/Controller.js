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
  package: 'com.google.foam.demos.heroes',
  name: 'Controller',
  extends: 'foam.u2.Element',

  requires: [
    'com.google.foam.demos.heroes.CitationView',
    'com.google.foam.demos.heroes.DashboardCitationView',
    'com.google.foam.demos.heroes.Hero',
    'foam.u2.DAOListView',
    'foam.u2.DetailView',
    'foam.u2.CheckBox'
  ],

  exports: [
    'as data',
    'editHero'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        h2 { color: #444; font-weight: lighter; }
        body { margin: 2em; }
        body, input[text], button { color: #888; font-family: Cambria, Georgia; }
        button { padding: 0.2em; font-size: 14px}
        * { font-family: Arial; }
      */}
    })
  ],

  properties: [
    {
      // TODO:
      //      class: 'foam.core.types.DAO',
      name: 'heroDAO',
      view: {
        class: 'foam.u2.DAOListView',
        rowView: 'foam.demos.heroes.CitationView'
      },
      factory: function() {
        return JSONUtil.arrayToObjArray(this.X, [
          { id: 11, name: "Mr. Nice"},
          { id: 12, name: "Narco",     starred: true},
          { id: 13, name: "Bombasto",  starred: true},
          { id: 14, name: "Celeritas", starred: true},
          { id: 15, name: "Magneta",   starred: true},
          { id: 16, name: "RubberMan"},
          { id: 17, name: "Dynama"},
          { id: 18, name: "Dr IQ"},
          { id: 19, name: "Magma"},
          { id: 20, name: "Tornado"}
        ], this.Hero);
      }
    },
    {
      // TODO:
      // type: 'foam.core.types.DAO',
      name: 'starredHeroDAO',
      view: {
        class: 'foam.u2.DAOListView',
        rowView: 'foam.demos.heroes.DashboardCitationView'
      },
      factory: function() { return this.heroDAO.where(EQ(this.Hero.STARRED, true)); }
    },
    {
      name: 'view',
      value: 'dashboard'
    },
    {
      name: 'selection',
      view: { class: 'foam.u2.DetailView', title: '' }
    }
  ],

  methods: [
    function initE() {
      this.
        start('h2').add('Tour of Heroes').end().
        br().
        add(this.DASHBOARD, this.HEROES).
        br().
        add(this.slot(selection, view) {
          return selection ? this.detailE() :
            v === 'dashboard' ? this.dashboardE() :
            this.heroesE();
        });
    },

    function detailE() {
      return this.E().add(this.selection.name$, ' details!', this.SELECTION, this.BACK);
    },

    function dashboardE() {
      return this.E().start('h3').add('Top Heroes').end().add(this.STARRED_HERO_DAO);
    },

    function heroesE() {
      return this.E().start('h3').add('My Heroes').end();
    },

    function editHero(hero) {
      this.selection = hero;
    }
  ],

  actions: [
    {
      name: 'dashboard',
      isEnabled: function(view) { return view != 'dashboard'; },
      code: function(view) { this.back(); view = 'dashboard'; }
    },
    {
      name: 'heroes',
      isEnabled: function(view) { return view != 'heroes'; },
      code: function(view) { this.back(); view = 'heroes'; }
    },
    {
      name: 'back',
      code: function(selection) { selection = null; }
    }
  ]
});
