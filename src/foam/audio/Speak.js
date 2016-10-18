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

      if ( this.voice ) u.voice = this.voice;

      synth.speak(u);
    }
  ]
});
