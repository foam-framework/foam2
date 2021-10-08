/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.sweeper',
  name: 'Cell',
  extends: 'foam.u2.Element',

  imports: [ 'board', 'youLose', 'unminedCount' ],

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
      postSet: function(old, covered) {
        if ( old && ! covered ) {
          if ( this.mined ) this.youLose(); else this.unminedCount--;
        }
      },
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
      if ( ! this.mined ) this.unminedCount++;

      this.
        setNodeName('span').
        addClass(this.myClass()).
        addClass(this.stateClass$).
        on('click',       this.sweep).
        on('contextmenu', this.mark).
        start('span').addClass(this.myClass('flag')).entity('#x2691').end();

      if ( this.mined ) {
        this.start('font').style({'padding-left':'4px'}).entity('#x2699').end();
      }

      if ( ! this.mined && this.mineCount ) {
        this.start('font').attrs({color: this.COLOURS[this.mineCount]}).add(this.mineCount).end();
      }
    }
  ],

  listeners: [
    function mark(e)  { if ( this.covered ) this.marked = ! this.marked; e.preventDefault(); },
    function sweep(e) { if ( ! this.marked ) this.covered = false; }
  ]
});
