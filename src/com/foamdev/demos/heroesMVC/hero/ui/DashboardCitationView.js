/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.heroesMVC.hero.ui',
  name: 'DashboardCitationView',
  extends: 'foam.u2.View',

  imports: [ 'editHero' ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
      ^ {
        background: #607d8b;
        border: none;
        border-radius: 2px;
        color: white;
        display: block;
        margin: 10px;
        padding: 30px 20px;
        text-align: center;
        min-width: 100px;
      }
      ^:hover {
        background: #eee;
        color: #607d8b;
      }
      */}
    })
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).on('click', this.onClick).add(this.data.name$);
    }
  ],

  listeners: [
    function onClick() { this.editHero(this.data); }
  ]
});
