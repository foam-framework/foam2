/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.blocks',
  name: 'Wall',
  extends: 'foam.u2.Element',

  requires: [ 'com.google.foam.demos.blocks.Brick' ],

  imports: [ 'setTimeout' ],
  exports: [ 'as wall' ],

  css: `
    ^ {
      border: 1px solid gray;
      display: inline-block;
    }
  `,

  properties: [
    [ 'width',  20 ],
    [ 'height', 20 ],
    {
      name: 'cells',
      factory: function() {
        var cells = [];
        for ( var row = 0 ; row < this.height ; row++ ) {
          cells[row] = [];
          for ( var col = 0 ; col < this.width ; col++ ) {
            var cell = cells[row][col] = this.Brick.create({x: col, y: row});
            cell.removed$.sub(this.brickUpdated.bind(this, cell));
          }
        }
        return cells;
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
              this.add(self.cells[row][col]);
            }).
          end();
        });
    },

    function forNeighbour(cell, f, dx, dy) {
      var x = cell.x + dx;
      var y = cell.y + dy;
      if ( x > 0 && y > 0 && x < this.width && y < this.height )
        f(cell);
    },

    function forEachNeighbour(cell, f) {
      this.forNeighbour(cell, f,  0, -1);
      this.forNeighbour(cell, f, -1,  0);
      this.forNeighbour(cell, f, +1, -1);
    },

    function getWeight(cell) {
      var weight = 1;
      this.forEachNeighbour(cell, function(c) {
        weight += c.weight/10;
        c.weight *= 0.9;
      });
      return weight;
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
