/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC.hero.ui',
  name: 'DetailHeroView',
  extends: 'foam.u2.Element',

  imports: [
    'data',
    'heroesDAO'
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
    input {
      font-size: 1em;
      height: 2em;
      padding-left: .4em;
    }
  `,

  properties: [
    {
      name: 'selection',
      view: { class: 'foam.u2.DetailView', title: '' }
    }
  ],

  methods: [
    function initE() {
       this.start('h3').
         add(this.data.selection.name$, ' details!').
        br().
        add(this.SELECTION, this.BACK)        ;
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
