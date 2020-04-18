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
      name: 'gameOver_'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.add(this.time$).tag('br').add(this.board);
      this.tick();
    },

    function gameOver() {
      this.gameOver_ = true;
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        if ( this.gameOver_ ) return;
        this.time++;
        this.tick();
      }
    }
  ]
});
