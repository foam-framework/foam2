/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC.hero.ui',
  name: 'DashboardHeroView',
  extends: 'foam.u2.Element',

  //TODO remove duplicated part
  imports: [
    'data',
    'heroDAO',
  ],
 
  css: `
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
  `,

  properties: [
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
        rowView: { class: 'com.foamdev.demos.heroesMVC.hero.ui.CitationView' }
      }
    },
    {
      name: 'starredHeroDAO',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'com.foamdev.demos.heroesMVC.hero.ui.DashboardCitationView' }
      },
      expression: function(filteredDAO) { return filteredDAO.where(this.EQ(this.Hero.STARRED, true)); }
    }
  ],

  methods: [
    function initE() {
      this.
        addClass(this.myClass('starred')).
        start('h3').add('Top Heroes').end().
        //add(this.data.STARRED_HERO_DAO)
        add(this.STARRED_HERO_DAO);//TODO to remove since it is duplicated
    }
  ]
});
