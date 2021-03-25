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
    { class: 'Boolean', name: 'trimZeros', value: true },
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
      if ( ! foam.Undefined.isInstance(this.min)  ) this.setAttribute('min',  this.min);
      if ( ! foam.Undefined.isInstance(this.max)  ) this.setAttribute('max',  this.max);
      if ( ! foam.Undefined.isInstance(this.step) ) this.setAttribute('step', this.step);
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
        var value = self.dataToText(data.get());
        view.set('0');
        view.set(value);
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

      if ( ! foam.Undefined.isInstance(p.precision) ) this.precision = p.precision;
      if ( ! foam.Undefined.isInstance(p.min)       ) this.min       = p.min;
      if ( ! foam.Undefined.isInstance(p.max)       ) this.max       = p.max;
    },

    function formatNumber(val) {
      val = (val || 0).toFixed(this.precision);
      return this.trimZeros ? Number(val).toString() : val;
    },

    function dataToText(val) {
      return foam.Undefined.isInstance(this.precision) ?
      '' + val :
      this.formatNumber(val) ;
    },

    function textToData(text) {
      return parseFloat(text) || 0;
    }
  ]
});
