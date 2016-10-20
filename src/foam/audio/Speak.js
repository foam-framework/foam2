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
  name: 'Speak',

  imports: [
    'window'
  ],

  properties: [
    {
      class: 'String',
      name: 'text'
    },
    {
      class: 'Float',
      name: 'volume',
      value: 0.5,
      view: { class: 'foam.u2.RangeView', maxValue: 1, step: 0.01 }
    },
    {
      class: 'Float',
      name: 'rate',
      value: 1,
      preSet: function(_, rate) {
        return Math.max(0.1, Math.min(rate, 10));
      },
      view: { class: 'foam.u2.RangeView', maxValue: 10, step: 0.01 }
    },
    {
      class: 'Float',
      name: 'pitch',
      value: 1,
      preSet: function(_, rate) {
        return Math.max(0, Math.min(rate, 2));
      },
      view: { class: 'foam.u2.RangeView', maxValue: 2, step: 0.01 }
    },
    {
      name: 'voice',
      view: function(_, X) {
        var synth = X.window.speechSynthesis;
        var view  = foam.u2.view.ChoiceView.create({
          choices: []
        }, X);

        function updateChoices() {
          view.choices = synth.getVoices().map(function(v) {
            if ( ! view.data && v.lang == 'en-US' ) view.data = v;
            return [v, v.name];
          });
        }

        updateChoices();
        synth.addEventListener('voiceschanged', updateChoices);

        return view;
      }
    }
  ],

  actions: [
    function play() {
      var synth = this.window.speechSynthesis;
      var u     = new SpeechSynthesisUtterance(this.text);

      u.voice  = this.voice;
      u.volume = this.volume;
      u.rate   = this.rate;
      u.pitch  = this.pitch;

      synth.speak(u);
    }
  ]
});
