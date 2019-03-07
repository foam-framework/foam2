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

      if ( ! foam.Undefined.isInstance(this.data) ) view.set(this.formatNumber(this.data));

      if ( this.onKey ) {
        this.on('blur', function() {
          var value = data.get();
          view.set(self.formatNumber(value));
        });
       }

      view.sub(function() {
        var text = view.get();
        data.set(self.textToData(text));

        if ( text.indexOf('.') > 0 && text.length - text.indexOf('.') - 1 > self.precision ) {
          view.set(text.substring(0, text.indexOf('.') + self.precision + 1));
        }
      });

      data.sub(function() {
        if ( data.get() == parseFloat(view.get()) ) return;
        view.set(self.formatNumber(data.get()));
      });
    },

    function fromProperty(p) {
      this.SUPER(p);

      this.precision = p.precision;
      this.min = p.min;
      this.max = p.max;
    },

    function formatNumber(val) {
      if ( ! val ) return '0';
      val = val.toFixed(this.precision);
      var i = val.length - 1;
      for ( ; i > 0 && val.charAt(i) === '0' ; i-- ) {}
      return val.substring(0, val.charAt(i) === '.' ? i : i + 1);
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
