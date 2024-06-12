/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.sweeper',
  name: 'Board',
  extends: 'foam.u2.Element',

  requires: [ 'foam.demos.sweeper.Cell' ],

  imports: [ 'setTimeout' ],
  exports: [ 'as board' ],

  css: `
    ^ {
      border: 1px solid gray;
      display: inline-block;
      margin-top: 10px;
    }
  `,

  properties: [
    [ 'width',  14 ],
    [ 'height', 14 ],
    {
      name: 'cells',
      factory: function() {
        var cells = [];
        for ( var row = 0 ; row < this.height ; row++ ) {
          cells[row] = [];
          for ( var col = 0 ; col < this.width ; col++ ) {
            var cell = cells[row][col] = this.Cell.create({x: col, y: row});
            cell.covered$.sub(this.cellUncovered.bind(this, cell));
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

    function forEachNeighbour(cell, f) {
      var maxRow = Math.min(this.height, cell.y+2);
      var maxCol = Math.min(this.width,  cell.x+2);

      for ( var row = Math.max(0, cell.y-1) ; row < maxRow ; row++ ) {
        for ( var col = Math.max(0, cell.x-1) ; col < maxCol ; col++ ) {
          f(this.cells[row][col]);
        }
      }
    },

    function getMineCount(cell) {
      var count = 0;
      this.forEachNeighbour(cell, function(c) { if ( c.mined ) count++; });
      return count;
    }
  ],

  listeners: [
    function cellUncovered(cell) {
      if ( cell.mineCount ) return;

      this.setTimeout(
        this.forEachNeighbour(
          cell,
          function(c) { if ( ! c.mined ) c.covered = false; }),
        32);
    }
  ]
});
