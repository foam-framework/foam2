foam.CLASS({
  name: 'TabataSoundView',

  requires: [ 'foam.audio.Beep' ],

  properties: [
    'data',
    {
      name: 'shortBeep',
      factory: function() {
        return this.Beep.create({duration: 150, frequency: 330, type: 'square'});
      }
    },
    {
      name: 'longBeep',
      factory: function() {
        return this.Beep.create({duration: 700, frequency: 500, type: 'square'});
      }
    }
  ],

  methods: [
   function init() {
     this.SUPER();

     this.data.remaining$.sub(this.onTick);
   }
  ],

  listeners: [
    function onTick() {
      if ( this.data.remaining === 0 ) {
        this.longBeep.play();
      } else if ( this.data.remaining < 4 ) {
        this.shortBeep.play();
      }
    }
  ]
});
