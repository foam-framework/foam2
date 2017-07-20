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

      if ( delim != '"' && delim != "'" ) return undefined;

      ps = ps.tail;

      var lastc = delim;
      var str = "";

      while ( ps.valid ) {
        var c = ps.head;
        if ( c == delim && lastc != escape ) break;

        if ( c != escape ) str += c;


        if ( c == '\\' && this.escapeChars[ps.tail.head] ) {
          c = this.escapeChars[ps.tail.head];
          str += c;
          ps = ps.tail;
        }

        lastc = c;
        ps = ps.tail;
      }

      return ps.tail.setValue(str);
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
