/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC',
  name: 'NavigationView',
  extends: 'foam.u2.Element',

  imports: [
    'data',
    'heroesDAO'
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

  methods: [
    function initE() {
      this.
        start().addClass(this.myClass('nav')).
          add(this.DASHBOARD, this.HEROES).
        end().
        br();
    }
  ],

  actions: [
    {//TODO did we need to import mode? or back?
     //(since this is an action, this refer to the controller object; can you confirm???)
      name: 'dashboard',
      isEnabled: function(mode) { return mode != 'dashboard'; },
      code: function() { this.back(); this.mode = 'dashboard'; }
    },
    {
      name: 'heroes',
      isEnabled: function(mode) { return mode != 'heroes'; },
      code: function() { this.back(); this.mode = 'heroes'; }
    }
  ]
});
