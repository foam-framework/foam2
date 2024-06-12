/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.blocks',
  name: 'Wall',
  extends: 'foam.u2.Element',

  requires: [ 'foam.demos.blocks.Brick' ],

  imports: [ 'setTimeout' ],
  exports: [ 'as wall' ],

  css: `
    ^ {
      border: 1px solid gray;
      display: inline-block;
    }
  `,

  properties: [
    [ 'width',  4 ],
    [ 'height', 4 ],
    {
      name: 'bricks',
      factory: function() {
        var bricks = [];
        for ( var col = 0 ; col < this.width ; col++ ) {
          bricks[col] = [];
          for ( var row = 0 ; row < this.height ; row++ ) {
            var cell = bricks[col][row] = this.Brick.create({x: col, y: row, base: row == this.height-1});
            // cell.removed$.sub(this.brickUpdated.bind(this, cell));
          }
        }
        return bricks;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.
        addClass(this.myClass()).
        repeat(0, this.height-1, function(row) {
          this.start('div').
            addClass(this.myClass('row')).
            repeat(0, this.width-1, function(col) {
              this.add(self.bricks[col][row]);
            }).
          end();
        });
    },

    function forNeighbour(cell, f, dx, dy) {
      var x = cell.x + dx;
      var y = cell.y + dy;
      if ( x >= 0 && y >= 0 && x < this.width && y < this.height ) {
        var n = this.bricks[x][y];
        if ( ! n.removed ) f(n);
      }
    },

    function forEachNeighbour(cell, f) {
      this.forNeighbour(cell, f,  0,  1);
   //   this.forNeighbour(cell, f, -1,  0);
   //   this.forNeighbour(cell, f,  1, -1);
    },

    function balanceBrick(brick) {
      this.forEachNeighbour(brick, function(n) {
        if ( ( n.base || n.force >= 0 ) && brick.force > 0 ) {
          brick.upForce++;
          n.downForce++;
        }
      });
    },

    function balance() {
      for ( var i = 0 ; i < 1 ; i++ )
        for ( var x = 0 ; x < this.width ; x++ ) {
          for ( var y = 0 ; y < this.height ; y++ ) {
            this.balanceBrick(this.bricks[x][y]);
          }
        }
    }
  ],

  listeners: [
    function brickUpdated(cell) {
      /*
      if ( cell.mineCount ) return;

      this.setTimeout(
        this.forEachNeighbour(
          cell,
          function(c) { if ( ! c.mined ) c.covered = false; }),
        32);
        */
    }
  ]
});
