/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.heroes',
  name: 'Controller',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.demos.heroes.CitationView',
    'foam.demos.heroes.DashboardCitationView',
    'foam.demos.heroes.Hero',
    'foam.dao.ArrayDAO',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList',
    'foam.u2.DetailView',
    'foam.u2.CheckBox'
  ],

  exports: [
    'as data',
    'heroDAO',
    'editHero'
  ],

  css: `
    h2 { color: #aaa; }
    h3 {
      color: #444;
      font-size: 1.75em;
      font-weight: 100;
      margin-top: 0;
    }
    body { margin: 2em; }
    body, input[text], button { color: #888; font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    ^starred .foam-u2-DAOList { display: flex; }
    * { font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    input {
      font-size: 1em;
      height: 2em;
      padding-left: .4em;
    }
    ^nav .foam-u2-ActionView {
      background: #eee;
      border-radius: 4px;
      border: none;
      color: #607D8B;
      cursor: pointer; cursor: hand;
      font-height: 18px;
      font-size: 1em;
      font-weight: 500;
      margin: 10px 3px;
      padding: 10px 12px;
    }
    ^nav .foam-u2-ActionView:hover {
      background-color: #cfd8dc;
    }
    ^nav .foam-u2-ActionView:disabled {
      -webkit-filter: none;
      background-color: #eee;
      color: #039be5;
      cursor: auto;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'heroName',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
    {
      name: 'heroDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: foam.demos.heroes.Hero,
          seqNo: true,
          cache: true,
          daoType: 'LOCAL',
        //      daoType: 'IDB',
        //      daoType: 'ARRAY',
          testData: [
            { id: 11, name: "Mr. Nice"},
            { name: "Narco",     starred: true },
            { name: "Bombasto",  starred: true },
            { name: "Celeritas", starred: true },
            { name: "Magneta",   starred: true },
            { name: "RubberMan" },
            { name: "StrongMan" },
            { name: "Dynama" },
            { name: "Dr. IQ" },
            { name: "Dr. Bad" },
            { name: "Magma" },
          ]
        });
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.demos.heroes.CitationView' }
      }
    },
    {
      class: 'String',
      name: 'query',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true
      }
    },
    {
      name: 'filteredDAO',
      expression: function(heroDAO, query) {
 // console.log('******************************** query: ', query);
        return heroDAO.where(this.CONTAINS_IC(this.Hero.NAME, query));
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.demos.heroes.CitationView' }
      }
    },
    {
      name: 'starredHeroDAO',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.demos.heroes.DashboardCitationView' }
      },
      expression: function(filteredDAO) { return filteredDAO.where(this.EQ(this.Hero.STARRED, true)); }
    },
    {
      name: 'mode',
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
          // TODO: start(this.HEROES) and set class
        add('Search: ', this.QUERY).
        br().
        start().addClass(this.myClass('nav')).
          add(this.DASHBOARD, this.HEROES).
        end().
        br().
        add(this.slot(function(selection, mode) {
          return selection       ? this.detailE()    :
            mode === 'dashboard' ? this.dashboardE() :
                                   this.heroesE()    ;
        }));
    },

    function detailE() {
      return this.E('h3').
        add(this.selection.name$, ' details!').
        br().
        add(this.SELECTION, this.BACK);
    },

    function dashboardE() {
      return this.E().
        addClass(this.myClass('starred')).
        start('h3').add('Top Heroes').end().
        add(this.STARRED_HERO_DAO);
    },

    function heroesE() {
      return this.E().
        start('h3').
          add('My Heroes').
        end().
        start().
          add('Hero name: ', this.HERO_NAME, ' ', this.ADD_HERO).
        end().
        add(this.FILTERED_DAO);
    },

    function editHero(hero) {
      this.selection = hero.clone();
    }
  ],

  actions: [
    {
      name: 'addHero',
      label: 'Add',
      isEnabled: function(heroName) { return !!heroName; },
      code: function() {
        this.heroDAO.put(this.Hero.create({name: this.heroName}));
        this.heroName = '';
      }
    },
    {
      name: 'dashboard',
      isEnabled: function(mode) { return mode != 'dashboard'; },
      code: function() { this.back(); this.mode = 'dashboard'; }
    },
    {
      name: 'heroes',
      isEnabled: function(mode) { return mode != 'heroes'; },
      code: function() { this.back(); this.mode = 'heroes'; }
    },
    {
      name: 'back',
      code: function() {
        if ( this.selection ) this.heroDAO.put(this.selection);
        this.selection = null;
      }
    }
  ]
});
