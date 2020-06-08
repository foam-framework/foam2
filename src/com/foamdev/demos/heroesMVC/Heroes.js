/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC',
  name: 'Heroes',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [ 'log' ],

  requires: [
    'com.google.foam.demos.heroesMVC.hero.Hero',
    'foam.dao.ArrayDAO',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList',
    'foam.dao.LoggingDAO',
  ],

  properties: [
    /*{//TODO should be moved to query model
      class: 'String',
      name: 'query',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true
      }
    },*/
    {
      name: 'heroDAO',
      factory: function() {
        return this.EasyDAO.create({//TypeError: self.log is not a function
          //TODO LoggingDAO is a new feature that cause this problem
          of: com.google.foam.demos.heroesMVC.hero.Hero,
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
        rowView: { class: 'com.foamdev.demos.heroesMVC.hero.ui.CitationView' }
      }
    },
    /*{//TODO should be moved to DAO model
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
    {//TODO the same as filteredDAO
      name: 'starredHeroDAO',
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'com.foamdev.demos.heroesMVC.hero.ui.DashboardCitationView' }
      },
      expression: function(filteredDAO) { return filteredDAO.where(this.EQ(this.Hero.STARRED, true)); }
    },*/
  ]
});
