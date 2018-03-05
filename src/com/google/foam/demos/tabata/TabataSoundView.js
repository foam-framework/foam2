/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  name: 'TabataSoundView',

  requires: [
    {
      path: 'foam.audio.Beep',
      flags: ['js'],
    },
    {
      path: 'foam.swift.ui.MidiNote',
      flags: ['swift'],
    },
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'Tabata',
      required: true,
      name: 'data',
    },
    {
      swiftType: 'MidiNote',
      name: 'shortBeep',
      factory: function() {
        return this.Beep.create({duration: 150, frequency: 330, type: 'triangle'});
      },
      swiftFactory: 'return MidiNote_create(["note": 65, "duration": Float(0.15)])',
    },
    {
      swiftType: 'MidiNote',
      name: 'longBeep',
      factory: function() {
        return this.Beep.create({duration: 700, frequency: 500, type: 'square'});
      },
      swiftFactory: 'return MidiNote_create(["note": 75, "duration": Float(0.7)])',
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
      */},
    },
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
      */},
    },
  ]
});
