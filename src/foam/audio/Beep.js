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
  package: 'foam.audio',
  name: 'Beep',

  imports: [
    'setTimeout',
    'window'
  ],

  properties: [
    [ 'gain', 1.0 ],
    [ 'duration', 200 ],
    {
      name: 'type',
      value: 'sine',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'sine', 'square', 'sawtooth', 'triangle' ] },
    },
    [ 'frequency' , 220 ]
  ],

  actions: [
    function play() {
      var audio = new this.window.AudioContext();
      var destination = audio.destination;
      var o = audio.createOscillator();
      var gain;
      if ( this.gain !== 1 ) {
        console.log('gain: ', this.gain);
        gain = audio.createGain();
        gain.gain.value = this.gain;
        gain.connect(destination);
        destination = gain;
      }
      o.frequency.value = this.frequency;
      o.type = this.type;
      o.connect(destination);
      o.start(0);
      this.setTimeout(function() {
        o.stop(0);
        if ( gain ) gain.disconnect(audio.destination);
        o.disconnect(destination);
        audio.close();
      }, this.duration);
    }
  ]
});
