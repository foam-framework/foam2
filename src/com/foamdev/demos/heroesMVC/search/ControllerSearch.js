/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC.search',//TODO fix the paackage name changement
  name: 'ControllerSearch',
  extends: 'com.google.foam.demos.heroesMVC.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'com.foamdev.demos.heroesMVC.search.Search',
    'com.foamdev.demos.heroesMVC.Heroes',

    'com.google.foam.demos.heroesMVC.hero.Hero',
    'foam.dao.ArrayDAO',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList',
    'foam.u2.DetailView',
    'foam.u2.CheckBox'
  ],

  exports: [
    'as data1',
    'query'
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
    {//TODO should be moved to query model
     // we need to create a sub controller
      class: 'String',
      name: 'queryc',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true
      }
    },
//     {
//       name   : 'queryc',
//       factory: function() { return this.Search.create(); }
//     }
  ],

  methods: [
    function initE() {
      //we don't need rooting since we can plug-in plug-out components
      this.
        add('Search c: ', this.QUERY).
        br();
    }
  ]
});
