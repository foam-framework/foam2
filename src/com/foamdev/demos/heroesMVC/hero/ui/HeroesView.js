/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC.hero.ui',
  name: 'HeroesView',
  extends: 'foam.u2.Element',

  imports: [
    'data',
    'heroesDAO'
  ],

//TODO check if we inherite css style from another class?
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
  `,

  properties: [

  ],

  methods: [
    function initE() {
      this.
        start('h3').
          add('My Heroes').
        end().
        start().
          add('Hero name: ', this.data.HERO_NAME, ' ', this.ADD_HERO).
          // if we build this property in the controller
          //add('Hero name: ', this.HERO_NAME, ' ', this.ADD_HERO).
        end().
        add(this.data.FILTERED_DAO);
    }
  ],

  actions: [
   {
      name: 'addHero',
      label: 'Add',
      isEnabled: function(heroName) { return !!heroName; },
      code: function() {
        this.heroesDAO.heroDAO.put(this.Hero.create({name: this.heroName}));
        this.heroName = '';
      }
    }
  ]
});
