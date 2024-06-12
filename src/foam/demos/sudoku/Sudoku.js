/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 **/

foam.CLASS({
  package: 'foam.demos.sudoku',
  name: 'Sudoku',
  extends: 'foam.u2.Controller',

  documentation: `
    Animated Sudoku solver.
    Explanation: https://0x657573.wordpress.com/2010/11/30/3x3-sudoku-puzzle-solver/
    Author: Kevin G. R. Greer
  `,

  classes: [
    {
      name: 'Cell',
      extends: 'foam.u2.TextField',

      properties: [
        [ 'size', 1 ],
        {
          name: 'data',
          adapt: function(_, v) { return ! v || v == '0' || v.toString().trim() == '' ? '' : v; }
        }
      ]
    }
  ],

  properties: [
    { name: 'speed', value: 25, view: 'foam.u2.RangeView' },
    {
      name: 'cells',
      adapt: function(_, cs) {
        for ( var a = 0 ; a < 3 ; a++ )
          for ( var b = 0 ; b < 3 ; b++ )
            for ( var c = 0 ; c < 3 ; c++ )
              for ( var d = 0 ; d < 3 ; d++ )
                cs[a][b][c][d] = this.Cell.create({data: cs[a][b][c][d]});
        return cs;
      }
    }
  ],

  methods: [
    function init() {
      this.cells = [
        [[[0,0,0],[0,7,1],[0,0,5]], [[5,0,0],[0,6,9],[0,7,1]], [[0,7,1],[8,5,3],[4,2,0]]],
        [[[0,1,0],[0,0,2],[0,0,0]], [[7,8,0],[1,5,4],[0,9,2]], [[0,4,0],[3,6,0],[1,8,0]]],
        [[[0,6,4],[0,2,3],[0,5,0]], [[9,0,5],[0,1,0],[0,0,0]], [[7,0,0],[5,9,0],[0,0,0]]]
/*
        [[[0,0,0],[0,5,9],[2,0,0]], [[0,0,6],[0,0,0],[0,0,8]], [[0,0,0],[0,0,0],[0,0,0]]],
        [[[0,4,5],[0,0,3],[0,0,6]], [[0,0,0],[0,0,0],[0,0,3]], [[0,0,0],[0,0,0],[0,5,4]]],
        [[[0,0,0],[0,0,0],[0,0,0]], [[3,2,5],[0,0,0],[0,0,0]], [[0,0,6],[0,0,0],[0,0,0]]]
*/
      ];
    },
    function initE(X) {
      this.br().add('Speed: ', this.SPEED).br().br();
      var cells = this.cells;
      for ( var a = 0 ; a < 3 ; a++ ) {
        this.start().style({display: 'block'}).call(function() {
          for ( var b = 0 ; b < 3 ; b++ ) {
            this.start().style({display: 'inline-block', border:'1px solid black'}).call(function() {
              for ( var c = 0 ; c < 3 ; c++ ) {
                this.start().call(function() {
                  for ( var d = 0 ; d < 3 ; d++ ) {
                    this.add(cells[a][b][c][d]);
                  }
                });
              }
            });
          }
        });
      }
      this.br().add(this.SOLVE);
    },
    function get(a, b, c, d) { return this.cells[a][b][c][d].data; },
    function set(a, b, c, d, n) {
      for ( var x = 0 ; x < 3 ; x++ )
        for ( var y = 0 ; y < 3 ; y++ )
          if ( this.get(a, b, x, y) == n || this.get(a, x, c, y) == n || this.get(x, b, y, d) == n ) return false;
      this.cells[a][b][c][d].data = n;
      return true;
    },
    async function s(a, b, c, d) {
      await new Promise((r) => window.setTimeout(r, 100-this.speed));
      if ( d == 3 ) { d = 0; c++; }
      if ( c == 3 ) { c = 0; b++; }
      if ( b == 3 ) { b = 0; a++; }
      if ( a == 3 ) return true;
      if ( this.get(a,b,c,d) ) return await this.s(a, b, c, d+1);
      for ( var n = 1 ; n <= 9 ; n++ )
        if ( this.set(a, b, c, d, n) && await this.s(a, b, c, d+1) ) return true;
      this.cells[a][b][c][d].data = 0;
      return false;
    }
  ],

  actions: [ function solve() { this.s(0,0,0,0); } ]
});
