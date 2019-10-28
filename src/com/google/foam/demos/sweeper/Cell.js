/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.sweeper',
  name: 'Cell',
  extends: 'foam.u2.Element',

  imports: [ 'board' ],

  constants: {
    COLOURS: [ '', 'green', 'blue', 'orange', 'red', 'red', 'red', 'red' ],
  },

  css: `
    body {
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^ {
      border: 1px solid gray;
      display: table-cell;
      font-weight: bold;
      height: 26px;
      text-align: center;
      vertical-align: middle;
      width: 26px;
    }
    ^covered {
      background: #ccc;
      box-shadow: -2px -2px 10px rgba(0,0,0,.25) inset, 2px 2px 10px white inset;
    }
    ^marked ^flag {
      display: block;
      color: #BD1616;
    }
    ^covered font { visibility: hidden; }
    ^marked font { display: none; }
    ^flag { display: none; }
    ^marked { background-color: #ccc; }
  `,

  properties: [
    'x',
    'y',
    {
      class: 'Int',
      name: 'mineCount',
      factory: function() { return this.board.getMineCount(this); }
    },
    {
      class: 'Boolean',
      name: 'covered',
      value: true
    },
    {
      class: 'Boolean',
      name: 'marked'
    },
    {
      class: 'Boolean',
      name: 'mined',
      factory: function() { return Math.random() < 0.18; }
    },
    {
      name: 'stateClass',
      expression: function(covered, marked) {
        return this.myClass(marked ? 'marked' : covered ? 'covered' : '');
      }
    }
  ],

  methods: [
    function initE() {
      this.
        setNodeName('span').
        addClass(this.myClass()).
        addClass(this.stateClass$).
        on('click',       this.sweep).
        on('contextmenu', this.mark).
        start('span').addClass(this.myClass('flag')).entity('#x2691').end();

      if ( this.mined ) {
        this.start('font').entity('#x2699').end();
      }

      if ( ! this.mined && this.mineCount ) {
        this.start('font').attrs({color: this.COLOURS[this.mineCount]}).add(this.mineCount).end();
      }
    }
  ],

  listeners: [
    function mark(e)  { this.marked = ! this.marked; e.preventDefault(); },
    function sweep(e) { this.covered = false; }
  ]
});
