/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'CellParser',
  extends: 'foam.parse.ImperativeGrammar',

  imports: [ 'cells' ],

  properties: [
    {
      name: 'symbols',
      factory: function() {
        return function(alt, sym, seq1, seq, literalIC, repeat, str, optional, plus, range, anyChar) {
          return {
            START: sym('expr'),

            expr: seq(sym('expr1'), optional(seq(alt('+', '-'), sym('expr')))),

            expr1: seq(sym('expr2'), optional(seq(alt('*', '/'), sym('expr1')))),

            expr2: seq(sym('expr3'), optional(seq('^', sym('expr2')))),

            expr3: alt(
              sym('fun'),
              sym('cell'),
              sym('number'),
              sym('group')),

            fun: seq(
              sym('symbol'),
              '()'),

            xxxexpr: alt(
              //sym('cell'),
              sym('add'),
              sym('number'),
              sym('sub'),
              sym('mul'),
              sym('div'),
              sym('mod'),
              sym('sum'),
              sym('prod'),
              //sym('flow')
            ),

            add:  seq(sym('number'), '+', sym('number')),
            sub:  seq(literalIC('sub('),  sym('expr'), ',', sym('expr'), ')'),
            mul:  seq(literalIC('mul('),  sym('expr'), ',', sym('expr'), ')'),
            div:  seq(literalIC('div('),  sym('expr'), ',', sym('expr'), ')'),
            mod:  seq(literalIC('mod('),  sym('expr'), ',', sym('expr'), ')'),
            sum:  seq1(1, literalIC('sum('),  sym('vargs'), ')'),
            prod: seq1(1, literalIC('prod('), sym('vargs'), ')'),
            flow: seq(literalIC('flow('),  sym('symbol'), ',', sym('symbol'), ')'),

            vargs: repeat(alt(sym('range'), sym('expr')), ','),

            range: seq(sym('col'), sym('row'), ':', sym('col'), sym('row')),

            group: seq1(1, '(', sym('expr'), ')'),

            number: str(seq(
              optional('-'),
              str(alt(
                seq(str(repeat(sym('digit'))), '.', str(plus(sym('digit')))),
                plus(sym('digit')))))),

            cell: sym('symbol'),

            col: alt(sym('az'), sym('AZ')),

            digit: range('0', '9'),

            az: range('a', 'z'),

            AZ: range('A', 'Z'),

            row: str(repeat(sym('digit'), null, 1, 2)),

            symbol: str(seq(
              alt(range('a', 'z'), range('A', 'Z')),
              str(repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9')))))),

            string: str(repeat(anyChar()))
          };
        }
      }
    }
  ],

  methods: [
    function init() {
      var slot  = this.slot.bind(this);
      var cell  = this.cells.cell.bind(this.cells);
      var scope = this.cells.scope;

      this.addActions({
        expr: function(a) {
          if ( ! a[1] ) return a[0];
          return slot(
            a[1][0] == '+' ?
              function(a, b) { return a + b; } :
              function(a, b) { return a - b; } ,
            a[0],
            a[1][1]);
        },
        expr1: function(a) {
          if ( ! a[1] ) return a[0];
          return slot(
            a[1][0] == '*' ?
              function(a, b) { return a * b; } :
              function(a, b) { return a / b; } ,
            a[0],
            a[1][1]);
        },
        expr2: function(a) {
          if ( ! a[1] ) return a[0];
          return slot(function(a, b) { return Math.pow(a, b); }, a[0], a[1][1]);
        },
        add: function(a) { return slot(function() { return a[0].get() + a[2].get(); }, a[0], a[2]); },
        sub: function(a) { return slot(function() { return a[1].get() - a[3].get(); }, a[1], a[3]); },
        mul: function(a) { return slot(function() { return a[1].get() * a[3].get(); }, a[1], a[3]); },
        div: function(a) { return slot(function() { return a[1].get() / a[3].get(); }, a[1], a[3]); },
        mod: function(a) { return slot(function() { return a[1].get() % a[3].get(); }, a[1], a[3]); },
        sum: function(s) { return s.map(function(s) {
          var a = s[0].get();
          var sum = 0;
          for ( var i = 0 ; i < a.length ; i++ ) sum += a[i];
          return sum;
        }); },
        prod: function(s) { return s.map(function(s) {
          var a = s[0].get();
          var prod = 0;
          for ( var i = 0 ; i < a.length ; i++ ) prod *= a[i];
          return prod;
        }); },
        flow: function(a) { return scope[a[1]].slot(a[3]); },
        az:  function(c) { return c.toUpperCase(); },
        row: function(c) { return parseInt(c); },
        number: function(s) {
          var f = parseFloat(s);
          return foam.core.ConstantSlot.create({value: f});
        },
        fun: function(a) {
          var c = cell(a[0]);
          return foam.core.ConstantSlot.create({value: c.value()});
        },
        cell: function(a) {
          var c = cell(a);
          return c.numValue$;
        },
        vargs: function(a) {
          return foam.core.ExpressionSlot.create({
            code: function() {
              var ret = [];
              for ( var i = 0 ; i < a.length ; i++ ) {
                var r = a[i];
                if ( Array.isArray(r) )
                  ret.push.apply(ret, r);
                else
                  ret.push(r);
              }
              return ret;
            },
            args: a
          });
        },
        range: function(a) {
          var c1 = a[0], r1 = a[1], c2 = a[3], r2 = a[4];
          var slots = [];

          for ( var c = c1 ; c <= c2; c++ )
            for ( var r = r1 ; r <= r2 ; r++ )
              slots.push(cell(c + r).numValue$);

          return foam.core.ExpressionSlot.create({
            code: function() {
              return arguments;
            },
            args: slots
          });
        },
        string: function(s) {
          return foam.core.ConstantSlot.create({value: s});
        }
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Row',
  extends: 'foam.u2.Controller',

  imports: [ 'parser' ],

  css: `
    ^ * {
      font: 24px roboto, arial, sans-serif;
    }
    ^value {
      font: 24px roboto, arial, sans-serif;
    }
    ^ .property-id input {
      font-weight: 700;
    }
    ^ .foam-u2-ReadWriteView {
      display: inline-block;
      width: 302px;
    }
    ^ .foam-u2-ReadWriteView span span {
      font: 24px roboto, arial, sans-serif;
    }
    ^ input {
      height: 34px;
      font: 24px roboto, arial, sans-serif;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'id',
      view: 'foam.u2.ReadWriteView',
      width: 10
    },
    {
      class: 'String',
      name: 'expression',
      onKey: true,
      width: 50
    },
    {
      // class: 'String',
      name: 'value'
    },
    {
      name: 'numValue',
      expression: function(value) { return parseFloat(value); }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('span')
          .add(this.ID)
        .end()
        .start('span')
          .add(this.EXPRESSION)
        .end()
        .start('span')
          .style({padding: 4, 'font-weight': 800})
          .add('=')
        .end()
        .start('span')
          .addClass(this.myClass('value'))
          .add(this.value$)
        .end();

        var s;
        this.expression$.sub(() => {
          s && s.detach();

          var slot = this.parser.parseString(this.expression);
          s = this.value$.follow(slot)
        });
    }
  ]
});

// https://www.artima.com/pins1ed/the-scells-spreadsheet.html
foam.CLASS({
  package: 'com.google.flow',
  name: 'Calc',
  extends: 'foam.u2.Element',

  requires: [
    'com.google.flow.CellParser',
    'com.google.flow.Row',
    'foam.u2.tag.Input'
  ],

  imports: [ 'scope?' ], // Used by flow() function
  exports: [ 'as cells', 'parser' ],

  css: `
    ^ tr, ^ td, ^ th, ^ input {
      color: #333;
      font: 13px roboto, arial, sans-serif;
    }
    ^ tr { height: 26px; }
    ^cell { min-width: 102px; }
    ^, ^ th, ^ td { border: 1px solid #ccc; }
    ^ td { height: 100%; }
    ^ th, ^ td {
      border-right: none;
      border-bottom: none;
    }
    ^ th {
      background: #eee;
      color: #333;
      padding: 2px 18px;
    }
    ^ {
      border-left: none;
      border-top: none;
      overflow: auto;
    }
  `,

  properties: [
//    [ 'rows',    99 ],
//    [ 'columns', 26 ],
//    [ 'rows',    10 ],
    [ 'columns', 7 ],
    {
      name: 'cells',
      factory: function() { return {}; }
    },
    {
      name: 'parser',
      factory: function() { return this.CellParser.create(); }
    },
    {
      class: 'FObjectArray',
      of: 'com.google.flow.Row',
      name: 'rows'
    },
    {
      name: 'nextRowId_',
      value: 'a'
    }
  ],

  methods: [
    function nextRowId() {
      var advance = () => {
        this.nextRowId_ = String.fromCharCode(this.nextRowId_.charCodeAt(0) + 1);
      };
      while ( this.cell(this.nextRowId_) ) advance();
      var ret = this.nextRowId_;
      advance();
      return ret;
    },

    function addRow(watch) {
      var row = this.Row.create({id: this.nextRowId()});
      this.rows.push(row);
      this.add(row);

      if ( watch ) {
        row.expression$.sub(foam.events.oneTime(() => {
          this.addRow(watch);
        }));
      }
      return row;
    },

    function addHiddenRow(id, expression) {
      var row = this.Row.create({id: id, expression: expression});
      this.rows.push(row);
      return row;
    },

    function initE() {
      this.SUPER();
      var self = this;
      var row;
      this.rows.push(row = this.Row.create({id: 'PI', value: Math.PI}));
      this.add(row);
      this.rows.push(this.Row.create({id: 'E', value: Math.E}));
      this.rows.push(this.Row.create({id: 'random', value: Math.random}));

      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow(true);
    },

    function loadCells(map) {
      for ( var key in map ) this.cell(key).formula = String(map[key]);
    },

    function save() {
      var map = {};
      for ( var key in this.cells ) {
        var cell = this.cells[key];
        if ( cell.formula !== '' ) map[key] = cell.formula;
      }
      return map;
    },

    function cell(name) {
      var ret = this.rows.find(row => row.id === name);
      return ret;
    }
  ]
});
