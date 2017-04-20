/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.u2.view',
  name: 'StringArrayView',
  extends: 'foam.u2.tag.Input',
  properties: [
    {
      name: 'data',
      preSet: function(o, d) {
        return d;
      }
    },
    {
      class: 'Function',
      name: 'valueToText',
      value: function(value) {
        return value.map(function(m) {
          return m.replace("\\", "\\\\").replace(",", "\\,");
        }).join(',');
      }
    },
    {
      class: 'Function',
      name: 'textToValue',
      value: function(text) {
        if ( ! text ) return [];

        var value = [];
        var escape = false;
        var start = 0;
        for ( var i = 0 ; i < text.length ; i++ ) {
          if ( escape ) {
            escape = false;
            continue;
          }

          if ( i == text.length - 1 ) {
            value.push(text.substring(start, i+1).replace(/\\(.)/, "$0"));
          } else if ( text[i] == ',' || i == text.length - 1 ) {
            value.push(text.substring(start, i).replace(/\\(.)/, "$0"));
            start = ++i;
          } else if ( text[i] == '\\' ) {
            escape = true;
          }
        }

        return value;
      }
    }
  ],
  methods: [
    function link() {
      this.attrSlot().relateFrom(this.data$, this.textToValue, this.valueToText);
    }
  ]
});
