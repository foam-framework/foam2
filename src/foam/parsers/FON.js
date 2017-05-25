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
  package: 'foam.parsers',
  name: 'FON',
  methods: [
    function parseString(str) {
      var res = this.grammar.parseString(str, 'obj');
      if ( ! res ) return null;
      return foam.json.parse(res, null, this);
    }
  ],
  grammars: [
    {
      name: 'grammar',
      language: 'foam.parse.json.Parsers',
      symbols: function() {
        return {
          'obj': seq(sym('ws'),
                     '{', sym('ws'),
                     repeat(sym('keyValue'), seq0(',', sym('ws'))),
                     sym('ws'),
                     '}',
                     sym('ws')),
          'keyValue': seq(sym('key'), sym('ws'),
                          ':', sym('ws'),
                          sym('value'), sym('ws')),

          'key': alt(string(),
                     sym('identifier')),

          'ws': repeat0(chars(' \t\r\n')),

          // TODO: Support all valid characters, should consult unicode tables for things like ID_Start
          'id_start': alt(
            range('a', 'z'),
            range('A', 'Z'),
            '_',
            '$'),

          'identifier': substring(seq0(
            sym('id_start'),
            repeat0(alt(range('0', '9'), sym('id_start'))))),

          'value': alt(
            string(),
            sym('null'),
            sym('undefined'),
            sym('number'),
            sym('bool'),
            sym('array'),
            sym('obj')),

          'null': literal('null', null),
          'undefined': literal('undefined', undefined),
          'number': substring(seq0(optional('-'),
                             repeat0(range('0', '9'), null, 1),
                             optional(seq0('.',
                                           repeat0(range('0', '9')))))),
          'bool': alt(literal('true', true),
                      literal('false', false)),

          'array': seq1(2,
                        '[', sym('ws'),
                        repeat(sym('value'), seq0(',', sym('ws'))), sym('ws'),
                       ']', sym('ws'))
        };
      },
      actions: [
        function obj(a) {
          var obj = {};
          for ( var i = 0 ; i < a[3].length ; i++ ) {
            obj[a[3][i][0]] = a[3][i][4];
          }
          return obj
        },
        function number(a) {
          return parseFloat(a);
        }
      ]
    }
  ]
});
