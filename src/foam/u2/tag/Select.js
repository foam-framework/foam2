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
  package: 'foam.u2.tag',
  name: 'Select',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^:disabled {
          appearance: none;
          -moz-appearance:none;
          -webkit-appearance:none;
          border: none;
          background: rgba(0,0,0,0);
          color: initial;
        }
      */}
    })
  ],

  properties: [
    [ 'nodeName', 'select' ],
    {
      name: 'choices',
      factory: function() {
        return [];
      }
    },
    {
      name: 'placeholder',
      factory: function() {
        return undefined;
      }
    },
    {
      name: 'size'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .attrs({size: this.size$})
        .attrSlot().linkFrom(this.data$);

      this.setChildren(this.slot(function(choices, placeholder) {
        var cs = [];

        if ( placeholder ) {
          cs.push(self.E('option').attrs({
            value: -1,
            selected: self.data == -1 ? true : undefined
          }).add(self.placeholder));
        }

        for ( var i = 0 ; i < choices.length ; i++ ) {
          var c = choices[i];
          cs.push(self.E('option').attrs({
            value: i,
            selected: self.data === i ? true : undefined
          }).add(c[1]));
        }

        return cs;
      }));
    },

    function updateMode_(mode) {
      this.setAttribute(
        'disabled',
        mode === foam.u2.DisplayMode.DISABLED || mode === foam.u2.DisplayMode.RO);
    }

  ]
});
