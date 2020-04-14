/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.input',
  name: 'Gamepad',

  imports: [ 'timer' ],

  topics: [ 'pressed' ],

  properties: [
    {
      name: 'id',
      value: 0
    },
    { class: 'Boolean', name: 'button0' },
    { class: 'Boolean', name: 'button1' },
    { class: 'Boolean', name: 'button2' },
    { class: 'Boolean', name: 'button3' },
    { class: 'Boolean', name: 'button4' },
    { class: 'Boolean', name: 'button5' },
    { class: 'Boolean', name: 'button6' },
    { class: 'Boolean', name: 'button7' },
    { class: 'Boolean', name: 'button8' },
    { class: 'Boolean', name: 'button9' }
  ],

  methods: [
    function init() {
      if ( this.timer ) this.timer.i$.sub(this.update);
    }
  ],

  listeners: [
    function update() {
      var gp = navigator.getGamepads()[this.id];
      if ( gp ) {
        for ( var i = 0 ; i < 10 ; i++ ) {
          var pressed = gp.buttons[i].pressed;
          var button  = 'button' + i;
          if ( pressed && ! this[button] ) {
            this.pressed.pub(button);
          }
          this[button] = pressed;
        }
      } else {
        for ( var i = 0 ; i < 10 ; i++ ) {
          this['button' + i] = false;
        }
      }
    }
  ]
});
