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
  name: 'Game',
  extends: 'foam.u2.Element',

  requires: [ 'com.google.foam.demos.sweeper.Board' ],

  exports: [ 'gameOver' ],

  css: `
    ^ {
      font-family: sans-serif;
      margin: 20px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'time'
    },
    {
      name: 'board',
      factory: function() { return this.Board.create(); }
    },
    {
      class: 'Boolean',
      name: 'isGameOver'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.
        addClass(this.myClass()).
        add('Time: ', this.time$).
        start('span').
          show(this.isGameOver_$).
          style({color: 'red', "margin-Left": "250px"}).
          add('Game Over!').
        end().
        br().
        add(this.board);
      this.tick();
    },

    function gameOver() {
      this.isGameOver_ = true;
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        if ( this.isGameOver_ ) return;
        this.time++;
        this.tick();
      }
    }
  ]
});
