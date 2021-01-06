foam.CLASS({
  name: 'ExGen',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.audio.Beep',
    'foam.util.Timer'
  ],

  classes: [
    {
      name: 'Exercise',
      properties: [
        {
          class: 'String',
          name: 'name',
        },
        {
          class: 'Int',
          name: 'duration'
        },
        {
          class: 'Float',
          name: 'weight',
          value: 1
        }
      ]
    }
  ],

  css: `
    ^ {
      color: #555;
      font-size: larger;
    }
    ^title {
      background: #eee;
      color: cornflowerblue;
      font-size: larger;
      padding-left: 4px;
      text-shadow: 2px 2px #bbb;
      width: 100%;
    }
    ^row {
      padding-left: 4px;
    }
    .foam-u2-ActionView-medium {
      font-size: 10px !important;
      vertical-align: middle !important;
    }
    ^row:hover {
      background: cornflowerblue;
      color: white;
      left-margin: 4px;
    }
    .foam-u2-ProgressView {
      margin-right: 2px;
      height: 40px;
      vertical-align: middle;
    }
    .property-duration input {
      width: 80px;
    }
    .foam-u2-ActionView-regenerate {
      margin-right: 80px !important;
    }
    .foam-u2-ActionView-startTimer, .foam-u2-ActionView-pause, .foam-u2-ActionView-next  {
      margin-left: 4px; float: right;
    }
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'Exercise',
      name: 'dictionary'
    },
    {
      class: 'Int',
      name: 'duration',
      value: 30
    },
    {
      class: 'FObjectArray',
      of: 'Exercise',
      name: 'program'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.util.Timer',
      name: 'timer',
      factory: function() { return this.Timer.create({minute: -1}); }
    },
    {
      name: 'totalWeight_',
      expression: function (dictionary) {
        return dictionary.reduce((acc, e) => acc + e.weight, 0);
      }
    },
    {
      name: 'totalDuration_',
      expression: function (program) {
        return program.reduce((acc, e) => acc + e.duration, 0);
      }
    },
    {
      name: 'beep',
      factory: function() { return this.Beep.create(); }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.dictionary = [
        { name: 'Bottom-Up Press',          duration: 2, weight: 0.2 },
        { name: 'Chin Ups',                 duration: 1 },
        { name: 'Clean & Press (L+R)',      duration: 2, weight: 2 },
        { name: 'Curls',                    duration: 1 },
        { name: 'Deck Squat',               duration: 1, weight: 0.2 },
        { name: 'Dips',                     duration: 1, weight: 2 },
        { name: 'Floor Press (L+R)',        duration: 2, weight: 2 },
        { name: 'Goblet Squat',             duration: 1, weight: 1.5 },
        { name: 'Halos',                    duration: 1, weight: 0.1 },
        { name: 'One-Arm Deadlift',         duration: 2, weight: 0.2 },
        { name: 'One-Arm One-Leg Deadlift', duration: 2, weight: 0.2 },
        { name: 'One-Arm Swings',           duration: 2, weight: 0.2 },
        { name: 'Pistols',                  duration: 2, weight: 0.2 },
        { name: 'Plank',                    duration: 3, weight: 0.25 },
        { name: 'Press (L+R)',              duration: 2, weight: 1 },
        { name: 'Push Ups',                 duration: 1, weight: 0.9 },
        { name: 'Rows (L+R)',               duration: 2, weight: 1.1 },
        { name: 'Snatch (L+R)',             duration: 2, weight: 1.5 },
        { name: 'Swings (10)',              duration: 1, weight: 4 },
        { name: 'Swings (20)',              duration: 2, weight: 2 },
        { name: 'Swings (30)',              duration: 3, weight: 0.5 },
        { name: 'TGU (L+R)',                duration: 2, weight: 3 },
        { name: 'Thrusters',                duration: 1, weight: 1 },
      ];

      this.regenerate();
      this.duration$.sub(()=>this.regenerate());

      // Stop timer when workout done
      this.timer.minute$.sub(()=>{
        this.beep.play();
        if ( this.timer.minute >= this.duration ) {
          this.timer.stop();
          this.minute = this.duration-1;
        }
      });

      var startTime;
      this
        .addClass(this.myClass())
        .start('h1')
          .addClass(self.myClass('title'))
          .add('Exercise Generator')
        .end()
        .add('Duration: ', this.DURATION, ' ', this.REGENERATE)

        .add('Minutes: ')
        .tag({class: foam.u2.ProgressView, data$: this.timer.minute$.map(m=>100*(m+1)/this.duration)})
        .start('span')
          .style({width: '10px', display: 'inline-block', 'padding-left': '4px', 'vertical-align': 'middle'})
          .start('span')
            .style({'margin-left':'-110px', color: '#aaa'})
            .add(this.timer.minute$.map(m=>m+1))
          .end()
        .end()

        .add('Seconds: ')
        .tag({class: foam.u2.ProgressView, data$: this.timer.second$.map(s=>100*s/60)})
        .start('span')
          .style({width: '10px', display: 'inline-block', 'padding-left': '4px', 'vertical-align': 'middle'})
          .start('span')
            .style({'margin-left':'-110px', color: '#aaa'})
            .add(this.timer.second$)
          .end()
        .end()

        .add(' ', this.START_TIMER, ' ', this.PAUSE, this.NEXT)
        .tag('hr')
        .forEach(this.program$, function(e, i) {
          if ( i == 0 ) startTime = 0;
          this
          .start()
            .addClass(self.myClass('row'))
            .add(' ')
            .start('span')
              .style({width: '400px', display: 'inline-block', 'margin-bottom': '4px'})
              .add(' ', e.name)
            .end()
            .call(function() {
              for ( var i = 0 ; i < e.duration ; i++ ) {
                let myStartTime = startTime + i;
                this.start({class: foam.u2.ProgressView, data$: self.timer.slot(function(minute, second) {
                  return self.timer.minute < myStartTime ? 0 : self.timer.minute > myStartTime ? 100 : 100*self.timer.second/60;
                })})
                .end();
              }
            })
            .start('span')
              .add('x')
              .style({'padding-top': '7px', 'margin-right': '4px', float: 'right'})
              .on('click', () => {
                var a = foam.Array.clone(self.program);
                a.splice(i, 1);
                self.program = a;
                self.fill();
              })
            .end()
          .end();
          startTime += e.duration;
        });
    },

    function pickRandomExercise() {
      var i = Math.random() * this.totalWeight_;
      for ( var j = 0, w = 0 ; ; j++ ) {
        w += this.dictionary[j].weight;
        if ( i < w ) return this.dictionary[j];
      }
    },

    function fill() {
      while ( this.totalDuration_ < this.duration ) {
        var e = this.pickRandomExercise();
        if ( this.totalDuration_ + e.duration <= this.duration ) {
          var a = foam.Array.clone(this.program);
          a.push(e);
          this.program = a;
        }
      }
    }
  ],

  actions: [
    function regenerate() {
      this.program = [];
      this.fill();
    },

    {
      name: 'startTimer',
      label: 'Start',
      isAvailable: function(timer$isStarted) { return ! timer$isStarted; },
      code: function start() {
        console.log('Start Time: ', new Date());
        this.timer.start();
      }
    },

    {
      name: 'next',
      isAvailable: function(timer$isStarted) { return timer$isStarted; },
      code: function() {
        this.timer.time = Math.floor((this.timer.time + 60000) / 60000) * 60000;
      }
    },

    {
      name: 'pause',
      isAvailable: function(timer$isStarted) { return timer$isStarted; },
      code: function() {
        this.timer.stop();
      }
    }
  ]
});
