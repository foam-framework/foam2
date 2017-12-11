/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'StringArrayView',
  extends: 'foam.u2.tag.Input',

  properties: [
    {
      name: 'data',
      preSet: function(o, d) { return d; }
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

        var value  = [];
        var escape = false;
        var start  = 0;
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
