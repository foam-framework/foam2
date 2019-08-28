/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'FloatView',
  extends: 'foam.u2.TextField',

  documentation: 'View for editing Float Properties.',

  css: `
    ^:read-only {
      border: none;
      background: rgba(0,0,0,0);
    }
  `,

  properties: [
    ['type', 'number'],
    { class: 'Float', name: 'data' },
    'precision',
    'min',
    'max',
    {
      class: 'Float',
      name: 'step',
      documentation: `The amount that the value should increment or decrement by
          when the arrow buttons in the input are clicked.`,
      value: 0.01
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      if ( this.min != undefined ) this.setAttribute('min', this.min);
      if ( this.max != undefined ) this.setAttribute('max', this.max);
      if ( this.step != undefined ) this.setAttribute('step', this.step);
    },

    function link() {
      if ( foam.Undefined.isInstance(this.precision) ) {
        this.attrSlot(null, this.onKey ? 'input' : null).relateFrom(
          this.data$,
          this.textToData.bind(this),
          this.dataToText.bind(this));
        return;
      }

      // limit to precision;
      var data = this.data$;
      var view = this.attrSlot(null, this.onKey ? 'input' : null);
      var self = this;

      if ( ! foam.Undefined.isInstance(this.data) ) view.set(this.dataToText(this.data));

      // When focus is lost on the view, force the view's value to equal the data
      // to ensure it's formatted properly.
      this.on('blur', function () {
        view.set(self.dataToText(data.get()));
      });

      var preventFeedback = false;
      view.sub(function() {
        if ( preventFeedback ) return;
        preventFeedback = true;
        data.set(self.textToData(view.get()));
        preventFeedback = false;
      });

      data.sub(function() {
        if ( preventFeedback ) return;
        preventFeedback = true;
        view.set(self.dataToText(data.get()));
        preventFeedback = false;
      });
    },

    function fromProperty(p) {
      this.SUPER(p);

      this.precision = p.precision;
      this.min = p.min;
      this.max = p.max;
    },

    function formatNumber(val) {
      if ( ! val ) val = 0;
      val = val.toFixed(this.precision);
      return val;
    },

    function dataToText(val) {
      return this.precision !== undefined ?
          this.formatNumber(val) :
          '' + val;
    },

    function textToData(text) {
      return parseFloat(text) || 0;
    }
  ]
});
