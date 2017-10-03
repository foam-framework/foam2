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
  package: 'foam.parse.json',
  name: 'String',

  constants: {
    CHAR_CODE_0:       '0'.charCodeAt(0),
    CHAR_CODE_9:       '9'.charCodeAt(0),
    CHAR_CODE_A_LOWER: 'a'.charCodeAt(0),
    CHAR_CODE_F_LOWER: 'f'.charCodeAt(0),
    CHAR_CODE_A_UPPER: 'A'.charCodeAt(0),
    CHAR_CODE_F_UPPER: 'F'.charCodeAt(0)
  },

  properties: [
    {
      class: 'String',
      name: 'escape',
      value: '\\'
    },
    {
      name: 'escapeChars',
      value: {
        'n': '\u000a',
        'f': '\u000c',
        'b': '\u0008',
        'r': '\u000d',
        't': '\u0009'
      }
    }
  ],

  methods: [
    function parse(ps, obj) {
      var delim = ps.head;
      var escape = this.escape;

      if ( delim !== '"' && delim !== "'" ) return undefined;

      ps = ps.tail;

      var lastc = delim;
      var str = '';

      while ( ps.valid ) {
        var c = ps.head;
        if ( c === delim && lastc !== escape ) break;

        if ( c !== escape ) {
          str += c;
        } else {
          var next = ps.tail.head;
          if ( next === escape ) {
            // "\\" parses to "\".
            str += escape;
            ps = ps.tail;
          } else if ( ps.tail.head === 'u' ) {
            // Unicode escape sequence: "\u####".
            // Extract "###".
            var hexCharCode = ps.tail.str[0].substr(ps.pos + 2, 4);
            // Verify that each character in sequence is a hex digit.
            for ( var i = 0; i < hexCharCode.length; i++ ) {
              var hexDigitCharCode = hexCharCode.charCodeAt(i);
              if ( ! this.isHexDigitCharCode_(hexDigitCharCode) )
                throw new Error('FON string parse error at ' + ps.pos + ': ' +
                                'Invalid unicode escape sequence: \\u' +
                                hexCharCode);
            }
            // Construct hex character and add it to str.
            var charCode = parseInt(hexCharCode, 16);
            c = String.fromCharCode(charCode);
            str += c;
            // Advance to last char in "\u####" escape sequence.
            ps = ps.tail.tail.tail.tail.tail;
          } else if ( this.escapeChars[ps.tail.head] ) {
            c = this.escapeChars[ps.tail.head];
            str += c;
            ps = ps.tail;
          }
        }

        lastc = c;
        ps = ps.tail;
      }

      return ps.tail.setValue(str);
    },

    function isHexDigitCharCode_(charCode) {
      return ( ( charCode >= this.CHAR_CODE_0 &&
                 charCode <= this.CHAR_CODE_9 ) ||
               ( charCode >= this.CHAR_CODE_A_LOWER &&
                 charCode <= this.CHAR_CODE_F_LOWER ) ||
               ( charCode >= this.CHAR_CODE_A_UPPER &&
                 charCode <= this.CHAR_CODE_F_UPPER ) );
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.json',
  name: 'Parsers',
  extends: 'foam.parse.Parsers',

  methods: [
    function string() {
      return foam.parse.json.String.create();
    }
  ]
});
