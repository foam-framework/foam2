/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.sweeper',
  name: 'Game',
  extends: 'foam.u2.Element',

  requires: [
    'foam.demos.sweeper.Board',
    'foam.audio.Speak'
  ],

  exports: [ 'youLose', 'unminedCount' ],

  css: `
    ^ {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 20px;
      width: 394px;
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
      name: 'isYouWin'
    },
    {
      class: 'Boolean',
      name: 'isYouLose'
    },
    {
      class: 'Int',
      name: 'unminedCount',
      postSet: function(_, count) { if ( ! count ) this.youWin(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.
        addClass(this.myClass()).
        add('Time: ', this.time$).
        start('span').
          show(this.isYouLose$).
          style({color: 'red', float: "right"}).
          add('You Lose!').
        end().
        start('span').
          show(this.isYouWin$).
          style({color: 'green', float: "right"}).
          add('You Win!').
        end().
        br().
        add(this.board);
      this.tick();
    },

    function youLose() {
      this.isYouLose = true;
      this.Speak.create({text: "Boom! Game Over."}).play();
    },

    function youWin() {
      this.isYouWin = true;
      this.Speak.create({text: "You Win!"}).play();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        if ( this.isYouWin || this.isYouLose ) return;
        this.time++;
        this.tick();
      }
    }
  ]
});
