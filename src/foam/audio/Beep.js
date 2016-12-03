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
    {
      class: 'Int',
      name: 'duration',
      value: 200,
      units: 'ms'
    },
    {
      name: 'type',
      value: 'triangle',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'sine', 'square', 'sawtooth', 'triangle' ] },
    },
    { class: 'Float', name: 'frequency' , value: 220, units: 'Hz' },
    { class: 'Float', name: 'fmFrequency', label: 'FM Frequency', value: 0, units: 'Hz' },
    { class: 'Float', name: 'fmAmplitude', label: 'FM Amplitude', value: 20, units: '%' },
    {
      name: 'fmType',
      label: 'FM Type',
      value: 'triangle',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'sine', 'square', 'sawtooth', 'triangle' ] },
    },
    { class: 'Float', name: 'amFrequency', label: 'AM Frequency', value: 0, units: 'Hz' },
    { class: 'Float', name: 'amAmplitude', label: 'AM Amplitude', value: 20, units: '%' },
    {
      name: 'amType',
      label: 'AM Type',
      value: 'triangle',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'sine', 'square', 'sawtooth', 'triangle' ] },
    },
    {
      class: 'Int',
      name: 'attack',
      units: 'ms'
    },
    {
      class: 'Int',
      name: 'decay',
      units: 'ms'
    }
  ],

  actions: [
    function play() {
      var audio       = new this.window.AudioContext();
      var destination = audio.destination;
      var o           = audio.createOscillator();
      var gain, fm, fmGain, am, amGain;

      if ( this.gain !== 1 || this.amFrequency ) {
        gain = audio.createGain();
        gain.gain.value = this.gain;
        gain.connect(destination);
        destination = gain;
      }

      o.frequency.value = this.frequency;
      o.type = this.type;
      o.connect(destination);

      if ( this.fmFrequency ) {
        fmGain = audio.createGain();
        fmGain.gain.value = this.fmAmplitude;
        fm = audio.createOscillator();
        fm.frequency.value = this.fmFrequency;
        fm.type = this.fmType;
        fm.connect(fmGain);
        fmGain.connect(o.frequency);
        fm.start();
      }

      if ( this.amFrequency ) {
        amGain = audio.createGain();
        amGain.gain.value = this.amAmplitude;
        am = audio.createOscillator();
        am.frequency.value = this.amFrequency;
        am.type = this.amType;
        am.connect(amGain);
        amGain.connect(gain.gain);
        am.start();
      }

      o.start(0);

      o.stop(audio.currentTime + this.duration/1000);

      // There should be a better way to know when to cleanup.
      this.setTimeout(function() {
        if ( gain   ) gain.disconnect(audio.destination);
        if ( fmGain ) fmGain.disconnect(o.frequency);
        if ( fm     ) fm.stop(0);
        if ( amGain ) amGain.disconnect(gain.gain);
        if ( am     ) am.stop(0);
        o.disconnect(destination);
        audio.close();
      }, this.duration+1000);
    }
  ]
});
