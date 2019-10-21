/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.blocks',
  name: 'Brick',
  extends: 'foam.u2.Element',

  imports: [ 'wall' ],

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
    ^removed { color: white; }
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
      name: 'myWeight',
      expression: function(removed) { return removed ? 0 : 100; }
    },
    {
      name: 'weight',
      expression: function(myWeight, topWeight, leftWeight, rightWeight, removed) {
        if ( removed ) return 0;
        return myWeight + topWeight;
//        return (myWeight + leftWeight + rightWeight)/3 + topWeight;
      }
    },
    {
      class: 'Int',
      name: 'topWeight',
      value: 0
    },
    {
      class: 'Int',
      name: 'leftWeight',
      value: 0
    },
    {
      class: 'Int',
      name: 'rightWeight',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'removed'
    }
  ],

  methods: [
    function initE() {
      this.
        setNodeName('span').
        addClass(this.myClass()).
        enableClass(this.myClass('removed'), this.removed$).
        on('click',       this.click).
//        on('contextmenu', this.mark).
        start('span').add(this.weight$).end();

    }
  ],

  listeners: [
    function click(e) { this.removed = ! this.removed; }
  ]
});
