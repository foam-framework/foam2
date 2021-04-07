/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// from: https://arstechnica.com/science/2014/05/win-at-rock-paper-scissors-by-knowing-thy-opponent/

foam.CLASS({
  package: 'foam.demos.u2',
  name: 'Round',

  label: '-------------------------------------------------------------------------------------',

  properties: [
    {
      name: 'myPlay',
      label: 'Me',
      visibility: 'RO',
      view: 'foam.u2.view.ValueView'
    },
    {
      name: 'yourPlay',
      label: 'Opponent',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: '--',
        choices: ['Rock', 'Paper', 'Scissors']
      },
      postSet: function(_, v) {
        if ( this.myPlay === this.yourPlay ) {
          this.status = 'Tie';
          return;
        }
        if ( this.myPlay === 'Rock' ) {
          if ( this.yourPlay === 'Scissors' ) {
            this.status = 'Win';
            return;
          }
        } else if ( this.myPlay === 'Paper' ) {
          if ( this.yourPlay === 'Rock' ) {
            this.status = 'Win';
            return;
          }
        } else /* Scissors */ {
          if ( this.yourPlay === 'Paper' ) {
            this.status = 'Win';
            return;
          }
        }
        this.status = 'Lose';
      }
    },
    {
      name: 'status',
      view: 'foam.u2.view.ValueView'
//      visibility: foam.u2.DisplayMode.RO
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.u2',
  name: 'RockPaperScissors',

  requires: [ 'foam.demos.u2.Round' ],

  constants: {
    BEATS: {
      Rock:     'Scissors',
      Paper:    'Rock',
      Scissors: 'Paper'
    },
    BEATEN_BY: {
      Rock:     'Paper',
      Paper:    'Scissors',
      Scissors: 'Rock'
    }
  },

  properties: [
    {
      class: 'Boolean',
      name: 'sophisticatedOpponent',
      view: { class: 'foam.u2.CheckBox', showLabel: false }
    },
    {
      name: 'opponentSex',
      view: { class: 'foam.u2.view.ChoiceView', placeholder: '--', choices: [ 'Male', 'Female' ] }
    },
    { class: 'Int', name: 'myScore', view: 'foam.u2.view.ValueView' },
    { class: 'Int', name: 'yourScore', label: 'Opponent Score', view: 'foam.u2.view.ValueView' },
    {
      class: 'FObjectArray',
      name: 'rounds',
      label: '',
      of: 'foam.demos.u2.Round',
      view: { class: 'foam.u2.view.FObjectArrayView', enableAdding: false, enableRemoving: false }
    }
  ],

  methods: [
    function init() {
      this.opponentSex$.sub(() => {
        var play = this.opponentSex === 'Male' ? 'Paper' : 'Scissors';

        // A sophisticated opponent should play either paper or scissors,
        // so scissors is only play which won't lose to either of those.
        if ( this.sophisticatedOpponent ) { play = 'Scissors'; }

        this.addRound(this.Round.create({myPlay: play}));
      });
    },

    function adjustPlay(play) {
      if ( this.sophisticatedOpponent ) {
        play = this.BEATS[this.BEATS[play]];
      }

      return play;
    },

    function addRound(r) {
      var a = foam.Array.clone(this.rounds);
      a.push(r);
      this.rounds = a;
      r.status$.sub(() => {
        var play;

        if ( r.status === 'Win' ) {
          this.myScore++;
          play = r.yourPlay;
        } else if ( r.status === 'Lose' ) {
          this.yourScore++;
          play = this.BEATS[r.yourPlay];
        } else {
          play = this.randomPlay();
        }

        this.addRound(this.Round.create({myPlay: this.adjustPlay(play)}));
      });
    },

    function onUpdate(i) {
      this.slot('yourPlay' + i).sub(() => {
        this['myPlay' + (i+1)] = this.randomPlay();
      });
    },

    function randomPlay() {
      var r = Math.random();
      if ( r < 1/3 ) return 'Rock';
      if ( r < 2/3 ) return 'Paper';
      return 'Scissors';
    }
  ]
});
