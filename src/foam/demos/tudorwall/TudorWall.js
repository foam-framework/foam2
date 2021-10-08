/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.demos.tudorwall',
  name: 'TudorWall',
  extends: 'foam.graphics.Box',
  exports:  [ 'as timer', 'cellSize', 'nx' ],

  classes: [
    {
      name: 'Cell',
      extends: 'foam.graphics.Box',
      imports: [ 'timer', 'cellSize', 'nx' ],
      constants: { FILL_RATIO: 0.64 },
      properties: [
        'row',
        'col',
        [ 'shadowBlur', 5 ],
        { name: 'lPhase', factory: function() { return Math.random() * Math.PI * 2; } }
      ],
      methods: [
        function initCView() {
          this.x = 4 + this.cellSize * this.col;
          this.y = 4 + this.cellSize * this.row;
          this.width = this.height = this.FILL_RATIO * this.cellSize;
          this.timer.time$.sub(this.onTick);
        },
      ],
      listeners: [
        function onTick() {
          var hue = ( this.col/this.nx*360 + this.timer.time/3 ) % 360; // TODO: fix
          var l   = 40 - 30*Math.cbrt(Math.sin(this.lPhase + this.timer.time/200));
          this.shadowColor = this.color = this.hsl(hue, 100, l);
        }
      ]
    }
  ],

  properties: [
    [ 'width',     500 ],
    [ 'height',    260 ],
    [ 'nx',        25 ],
    [ 'ny',        13 ],
    [ 'cellSize',  20 ],
    [ 'fillStyle', 'black' ],
    [ 'color',     'black' ],
    { class: 'Int', name: 'time' }
  ],

  methods: [
    function initCView() {
      for ( var i = 0 ; i < this.nx ; i++ )
        for ( var j = 0 ; j < this.ny ; j++ )
          this.add(this.Cell.create({row: j, col: i}));
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        this.time += 16;
        this.tick();
        this.invalidated.pub();
      }
    }
  ]
});
