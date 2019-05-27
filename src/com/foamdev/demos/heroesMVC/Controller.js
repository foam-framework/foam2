/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.heroesMVC',
  name: 'Controller',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'com.google.foam.demos.heroesMVC.hero.Hero.ui.CitationView',

    'com.google.foam.demos.heroesMVC.hero.Hero.ui.DetailHeroView',
    //'com.google.foam.demos.heroesMVC.Search',
    'com.google.foam.demos.heroesMVC.Heroes',
    
    'com.google.foam.demos.heroesMVC.hero.Hero.ui.DashboardCitationView',
    'com.google.foam.demos.heroesMVC.hero.Hero',
    'foam.dao.ArrayDAO',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList',
    'foam.u2.DetailView',
    'foam.u2.CheckBox'
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
    {//TODO should be moved to HeroesView
      class: 'String',
      name: 'heroName',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
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
        rowView: { class: 'com.google.foam.demos.heroesMVC.hero.Hero.ui.CitationView' }
      }
    },
    {//TODO the same as filteredDAO
      name: 'starredHeroDAO',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'com.google.foam.demos.heroesMVC.hero.Hero.ui.DashboardCitationView' }
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
        //start(com.google.foam.demos.heroesMVC.SearchView, {data: this.query}).end().//, {data: this.selection}
        br().
        start(com.google.foam.demos.heroesMVC.NavigationView).end().
        
        add(this.slot(function(selection, mode) {
          return selection       ? this.E().start(com.google.foam.demos.heroesMVC.hero.Hero.ui.DetailHeroView, {data: this.selection}): //this.detailE()    :
            mode === 'dashboard' ? this.E().start(com.google.foam.demos.heroesMVC.hero.Hero.ui.DashboardHeroView, {data: this.STARRED_HERO_DAO}): //this.dashboardE() :
                                   this.E().start(com.google.foam.demos.heroesMVC.hero.Hero.ui.HeroesView, {data: this.data}); //this.heroesE()    ;
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
