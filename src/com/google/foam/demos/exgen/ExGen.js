foam.CLASS({
  name: 'ExGen',
  extends: 'foam.u2.Controller',

  requires: [ 'foam.util.Timer' ],

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
          name: 'length'
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
      font-size: larger;
    }
    ^row:hover {
      left-margin: 4px;
      color: white;
      background: cornflowerblue;
    }
    .foam-u2-ProgressView {
      height: 40px;
      vertical-align: bottom;
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
      value: 10
    },
    {
      class: 'FObjectArray',
      of: 'Exercise',
      name: 'program'
    },
    {
      name: 'timer',
      factory: function() { return this.Timer.create({minute: 1}); }
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
        return program.reduce((acc, e) => acc + e.length, 0);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.dictionary = [
        { name: 'Chin Ups',            length: 1 },
        { name: 'Clean & Press (L+R)', length: 2, weight: 2 },
        { name: 'Curls',               length: 1 },
        { name: 'Dips',                length: 1, weight: 2 },
        { name: 'Floor Press (L+R)',   length: 2, weight: 2 },
        { name: 'Goblet Squat',        length: 1, weight: 1.5 },
        { name: 'Plank',               length: 3, weight: 0.25 },
        { name: 'Press (L+R)',         length: 2, weight: 2 },
        { name: 'Push Ups',            length: 1 },
        { name: 'Rows (L+R)',          length: 2 },
        { name: 'Snatch (L+R)',        length: 2, weight: 1.5 },
        { name: 'Swings (10)',         length: 1, weight: 3 },
        { name: 'Swings (20)',         length: 2 },
        { name: 'Swings (30)',         length: 3, weight: 0.5 },
        { name: 'TGU (L+R)',           length: 2, weight: 2 },
        { name: 'Thrusters',           length: 1, weight: 1 },
      ];

      this.regenerate();
      this.duration$.sub(()=>this.regenerate());

      //this.add(this.PROGRAM);
      this
        .addClass(this.myClass())
        .add('Duration: ', this.DURATION, ' ', this.REGENERATE, ' ')
        .add(' Seconds: ')
        .tag({class: foam.u2.ProgressView, data$: this.timer.second$.map(s=>100*s/60)})
        .start('span').style({width: '50px', display: 'inline-block', 'padding-left': '4px'}).add(this.timer.second$).end()
        .add(' Minutes: ')
        .tag({class: foam.u2.ProgressView, data$: this.timer.minute$.map(m=>100*m/this.duration)})
        .add(' ', this.timer.minute$)
        .add(' ', this.START_TIMER, ' ', this.PAUSE)
        .tag('hr')
        .forEach(this.program$, function(e, i) {
          this
          .start()
            .addClass(self.myClass('row'))
            .tag({class: 'foam.u2.CheckBox'})
            .add(' ')
            .start('span')
              .style({width: '400px', display: 'inline-block'})
              .add(' ', e.name)
            .end()
            .start('span')
              .add('x')
              .on('click', () => {
                var a = foam.Array.clone(self.program);
                a.splice(i, 1);
                self.program = a;
                self.fill();
              })
            .end()
          .end();
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
        var a = foam.Array.clone(this.program);
        a.push(e);
        this.program = a;
      }
    }
  ],

  actions: [
    function regenerate() {
      this.program = [];
      this.fill();
      /*
      var a = [];
      var l = 0;
      while ( l < this.duration ) {
        var e = this.pickRandomExercise();
        a.push(e);
        l += e.length;
      }
      this.program = a;
      */
    },

    {
      name: 'startTimer',
      label: 'Start',
      code: function start() {
        this.timer.start();
      }
    },

    function pause() {
      this.timer.stop();
    }
  ]
});
