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

  properties: [
    {
      class: 'FObjectArray',
      of: 'Exercise',
      name: 'dictionary'
    },
    {
      class: 'Int',
      name: 'length',
      value: 40
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
      this.dictionary = [
        { name: 'Chin Ups',      length: 1 },
        { name: 'Clean & Press', length: 2 },
        { name: 'Clean & Press', length: 2 },
        { name: 'Curls',         length: 1 },
        { name: 'Dips',          length: 1 },
        { name: 'Dips',          length: 1 },
        { name: 'Floor Press',   length: 2 },
        { name: 'Plank',         length: 3 },
        { name: 'Press',         length: 2 },
        { name: 'Push Ups',      length: 1 },
        { name: 'Rows ',         length: 2 },
        { name: 'Snatch',        length: 2 },
        { name: 'Squats',        length: 1 },
        { name: 'Swings (10)',   length: 1 },
        { name: 'Swings (10)',   length: 1 },
        { name: 'Swings (20)',   length: 2 },
        { name: 'Swings (30)',   length: 3 },
        { name: 'TGU',           length: 2 },
        { name: 'TGU',           length: 2 }
      ];

      //this.add(this.PROGRAM);
      this.add('Length: ', this.LENGTH, ' ', this.GENERATE).tag('hr');
      this.forEach(this.program$, function(e) { this.tag({class: 'foam.u2.CheckBox'}).add(' ', e.name).br(); });
      /*
      this.add(this.program$.map(function(p) {
        return self.E().forEach(p, );
      }));
      */
    }
  ],

  actions: [
    function generate() {
      var a = [];
      var l = 0;
      while ( l <= this.length ) {
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
