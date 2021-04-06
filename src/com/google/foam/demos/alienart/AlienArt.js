/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


// Based on the TudorWall demo and this tweet https://twitter.com/aemkei/status/1378106731386040322
foam.CLASS({
  package: 'com.google.foam.demos.alienart',
  name: 'AlienArt',
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
          var l   = 40 - 20*Math.cbrt(Math.sin(this.lPhase + this.timer.time/200));
          this.shadowColor = this.color = this.hsl(hue, 100, l);
        }
      ]
    }
  ],

  properties: [
    [ 'width',     1024 ],
    [ 'height',    512 ],
    [ 'nx',        256 ],
    [ 'ny',        128 ],
    [ 'cellSize',  4 ],
    [ 'fillStyle', 'black' ],
    [ 'color',     'black' ],
    { class: 'Int', name: 'time' }
  ],

  methods: [
    function initCView() {
      for ( var i = 0 ; i < this.nx ; i++ )
        for ( var j = 0 ; j < this.ny ; j++ )
          if ( (i ^ j) % 5 == 0 )
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
