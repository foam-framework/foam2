/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'TabataSoundView',

  requires: [
    {
      path: 'foam.audio.Beep',
      flags: ['js']
    },
    {
      path: 'foam.swift.ui.MidiNote',
      flags: ['swift']
    },
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'Tabata',
      required: true,
      name: 'data'
    },
    {
      swiftType: 'MidiNote',
      name: 'shortBeep',
      factory: function() {
        return this.Beep.create({duration: 150, frequency: 330, type: 'sine'});
      },
      swiftFactory: 'return MidiNote_create(["note": 65, "duration": Float(0.15)])'
    },
    {
      swiftType: 'MidiNote',
      name: 'longBeep',
      factory: function() {
        return this.Beep.create({duration: 600, frequency: 600, type: 'sine'});
      },
      swiftFactory: 'return MidiNote_create(["note": 75, "duration": Float(0.7)])'
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        this.onDetach(this.data.remaining$.sub(this.onTick));
      },
      swiftCode: function() {/*
super.__foamInit__()
onDetach(data.remaining$.swiftSub(onTick_listener))
      */}
    }
  ],

  listeners: [
    {
      name: 'onTick',
      code: function onTick() {
        if ( this.data.remaining === 0 ) {
          this.longBeep.play();
        } else if ( this.data.remaining < 4 ) {
          this.shortBeep.play();
        }
      },
      swiftCode: function() {/*
        if data.remaining == 0 {
          longBeep.play()
        } else if data.remaining < 4 {
          shortBeep.play()
        }
      */}
    }
  ]
});
