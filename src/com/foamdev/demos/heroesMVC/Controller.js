/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.heroesMVC',//TODO fix the paackage name changement
  name: 'Controller',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'com.foamdev.demos.heroesMVC.hero.ui.CitationView',

    'com.foamdev.demos.heroesMVC.hero.ui.DetailHeroView',
    //'com.foamdev.demos.heroesMVC.Search',
    'com.foamdev.demos.heroesMVC.Heroes',

    'com.foamdev.demos.heroesMVC.hero.ui.DashboardCitationView',
    'com.google.foam.demos.heroesMVC.hero.Hero',
    'foam.dao.ArrayDAO',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList',
    'foam.u2.DetailView',
    'foam.u2.CheckBox',
    'com.foamdev.demos.heroesMVC.search.ControllerSearch',
  ],

  exports: [
    'as data',
    //'heroDAO',
    'heroesDAO',
    'editHero',
    //'starredHeroDAO',
    //'Search'
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
    body, input[text], button { color: #888; font-family: Cambria, Georgia; }
    ^starred .foam-u2-DAOList { display: flex; }
    * { font-family: Arial; }
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
    { //TODO move to an other controller
      class: 'String',
      name: 'heroName',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
//     { //we can use Hero.name in a subcontroller
//       name: 'heroName',
//       factory: function() { return this.Hero.create().name; }
//     },
    {
      name   : 'heroesDAO',
      factory: function() { return this.Heroes.create(); }
    },
    {//TODO should be moved to query model
      class: 'String',
      name: 'query',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true
      }
    },
    //TODO Add the ControllerSearch
//      {
//        class: 'FObjectProperty',
//        of: 'com.foamdev.demos.heroesMVC.search.ControllerSearch',
//        name: 'controllerSearch1',
//        factory: function() {
//          return this.ControllerSearch.create();
//        }
//      },

   /* {//TODO delete it if possible
      name   : 'query',
      factory: function() { return this.Search.create(); }
    },*/
    {//TODO should be moved to ...(DAO layer)
      name: 'filteredDAO',
      expression: function(heroesDAO, query) {
      // console.log('******************************** query: ', query);
        return heroesDAO.heroDAO.where(this.CONTAINS_IC(this.Hero.NAME, query));
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'com.foamdev.demos.heroesMVC.hero.ui.CitationView' }
      }
    },
    {//TODO the same as filteredDAO
      name: 'starredHeroDAO',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'com.foamdev.demos.heroesMVC.hero.ui.DashboardCitationView' }
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
      //we don't need rooting since we can plug-in plug-out components
      this.
        start('h2').add('Tour of Heroes').end().
          // TODO: start(this.HEROES) and set class
        add('Search: ', this.QUERY).
        //start(com.foamdev.demos.heroesMVC.SearchView, {data: this.query}).end().//, {data: this.selection}
        br().
        start(com.foamdev.demos.heroesMVC.NavigationView).end().

        add(this.slot(function(selection, mode) {
          return selection       ? this.E().start(com.foamdev.demos.heroesMVC.hero.ui.DetailHeroView, {data: this.selection}): //this.detailE()    :
            mode === 'dashboard' ? this.E().start(com.foamdev.demos.heroesMVC.hero.ui.DashboardHeroView, {data: this.STARRED_HERO_DAO}): //this.dashboardE() :
                                   this.E().start(com.foamdev.demos.heroesMVC.hero.ui.HeroesView, {data: this.data}); //this.heroesE()    ;
        }));
    },
    function editHero(hero) {
      this.selection = hero.clone();
    }
  ],

  actions: [
    {
      name: 'back',
      code: function() {
        if ( this.selection ) this.heroesDAO.heroDAO.put(this.selection);
        this.selection = null;
      }
    }
  ]
});
