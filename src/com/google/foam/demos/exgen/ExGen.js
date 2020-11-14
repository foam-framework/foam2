foam.CLASS({
  name: 'ExGen',
  extends: 'foam.u2.Controller',

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
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.dictionary = [
        { name: 'Chin Ups',      length: 1 },
        { name: 'Clean & Press (L+R)', length: 2 },
        { name: 'Clean & Press (L+R)', length: 2 },
        { name: 'Curls',         length: 1 },
        { name: 'Dips',          length: 1 },
        { name: 'Dips',          length: 1 },
        { name: 'Floor Press (L+R)',   length: 2 },
        { name: 'Plank',         length: 3 },
        { name: 'Press (L+R)',         length: 2 },
        { name: 'Push Ups',      length: 1 },
        { name: 'Rows (L+R)',         length: 2 },
        { name: 'Snatch (L+R)',        length: 2 },
        { name: 'Squats (L+R)',        length: 1 },
        { name: 'Swings (10)',   length: 1 },
        { name: 'Swings (10)',   length: 1 },
        { name: 'Swings (20)',   length: 2 },
        { name: 'Swings (30)',   length: 3 },
        { name: 'TGU (L+R)',           length: 2 },
        { name: 'TGU (L+R)',           length: 2 }
      ];

      //this.add(this.PROGRAM);
      this
        .addClass(this.myClass())
        .add('Duration: ', this.DURATION, ' ', this.GENERATE)
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
              })
            .end()
          .end();
        });
      /*
      this.add(this.program$.map(function(p) {
        return self.E().forEach(p, function(e) { thi.add(e.something); }
      }));
      */
    }
  ],

  actions: [
    function generate() {
      var a = [];
      var l = 0;
      while ( l < this.duration ) {
        var e = this.dictionary[Math.floor(this.dictionary.length*Math.random())];
        a.push(e);
        l += e.length;
      }
      this.program = a;
    },

    function start() {
    },

    function pause() {
    }
  ]
});
