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
  package: 'com.google.net',
  name: 'ProtobufParser',

  requires: [
    'foam.parse.ImperativeGrammar'
  ],

  properties: [
    {
      name: 'grammar_',
      value: function(alt, anyChar, literal, literalIC, not, notChars, optional,
          plus, range, repeat, repeat0, seq, seq1, str, sym) {
        return {
          START: seq1(1, sym('ws'), sym('proto'), sym('ws')),

          d: range('0', '9'),

          w: alt(sym('d'), range('a', 'z'), range('A', 'Z'), literal('_')),

          a: alt(range('a', 'z'), range('A', 'Z')),

          white: alt(literal(' '),
              literal('\t'),
              literal('\r'),
              literal('\n'),
              sym('lineComment')),

          lineComment: seq(literal('//'), repeat0(notChars('\n'))),

          // 0 or more whitespace characters.
          ws: repeat0(sym('white')),
          // At least one whitespace character.
          ws1: seq(sym('white'), sym('ws')),

          proto: repeat(alt(
            sym('message'),
            sym('enum'),
            sym('extend'),
            sym('import'),
            sym('package'),
            sym('service'),
            sym('option'),
            sym('syntax')), sym('ws')),

          syntax: seq(literal('syntax'), sym('ws'), literal('='),
              sym('ws'), sym('strLit'), literal(';')),

          import: seq(literal('import'), sym('ws1'),
              optional(seq(literal('public'), sym('ws1'))),
              sym('strLit'), literal(';')),

          package: seq(
              literal('package'), sym('ws1'), sym('dottedIdents'),
              literal(';')),

          option: seq(literal('option'), sym('ws'),
              sym('optionBody'), literal(';')),

          optionBody: seq(
            alt(
              seq1(2, literal('('), sym('ws'), sym('dottedIdents'),
                  sym('ws'), literal(')')),
              sym('ident')),
            repeat(seq(sym('ws'), literal('.'), sym('ws'), sym('ident'))),
            sym('ws'), literal('='), sym('ws'),
            alt(sym('constant'), sym('map'))),

          message: seq(literal('message'), sym('ws1'), sym('ident'), sym('ws'),
              sym('messageBody')),

          enum: seq(literal('enum'), sym('ws1'), sym('ident'), sym('ws'),
              literal('{'), sym('ws'),
              repeat(alt(sym('option'), sym('enumField')), sym('ws')),
              sym('ws'), literal('}'), optional(literal(';'))),


          enumField: seq(sym('ident'), sym('ws'), literal('='),
              sym('ws'), sym('sintLit'), sym('ws'),
              optional(sym('fieldOptions')), sym('ws'), literal(';')),

          service: seq(literal('service'), sym('ws1'), sym('ident'), sym('ws'),
              literal('{'), sym('ws'),
              repeat(alt(sym('option'), sym('rpc')), sym('ws')),
              sym('ws'),
              literal('}'), optional(literal(';'))),

          rpc: seq(literal('rpc'), sym('ws1'), sym('ident'), sym('ws'),
              literal('('), sym('ws'), sym('userType'), sym('ws'), literal(')'),
              sym('ws'), literal('returns'), sym('ws'),
              literal('('), sym('ws'), sym('userType'), sym('ws'), literal(')'),
              sym('ws'),
              alt(seq1(2, literal('{'), sym('ws'),
                  repeat(sym('option'), sym('ws')),
                  sym('ws'), literal('}')),
                  literal(';'))),

          messageBody: seq(
              literal('{'), sym('ws'),
              repeat(
                  alt(sym('enum'), sym('message'), sym('option'),
                      sym('reserved'), sym('oneof'), sym('extensions'),
                      sym('field')),
                  sym('ws')),
              sym('ws'), literal('}'), optional(literal(';'))),

          // tag number must be 2^28-1 or lower
          field: seq(
              optional(seq(alt(
                  literal('repeated'),
                  // Even though "optional" and "required" are not supported in
                  // proto3, some included files may be in proto2 syntax.
                  literal('required'),
                  literal('optional')),
                  sym('ws1'))),
              sym('fieldType'),
              sym('ws1'),
              sym('ident'),
              sym('ws'),
              literal('='),
              sym('ws'),
              sym('intLit'),
              sym('ws'),
              optional(sym('fieldOptions')),
              sym('ws'),
              literal(';')),

          fieldOptions: seq1(2, literal('['), sym('ws'),
              plus(sym('optionBody'), seq(sym('ws'), literal(','), sym('ws'))),
              sym('ws'), literal(']')),

          oneof: seq(literal('oneof'), sym('ws1'), sym('ident'), sym('ws'),
              literal('{'), sym('ws'), repeat(sym('field'), sym('ws')),
              sym('ws'), literal('}')),

          reserved: seq(literal('reserved'), sym('ws1'),
              plus(sym('intLit'), seq(sym('ws'), literal(','), sym('ws'))),
              sym('ws'), literal(';')),

          extensions: seq(literal('extensions'), sym('ws1'), sym('decInt'),
              sym('ws1'), literal('to'), sym('ws1'),
              alt(literal('max'), sym('decInt')),
              sym('ws'), literal(';')),

          // Even though extends are not in proto3 syntax, some included files
          // may be in proto2 syntax.
          extend: seq(literal('extend'), sym('ws1'), sym('dottedIdents'),
              sym('ws'), sym('messageBody')),

          fieldType: alt(sym('mapType'), sym('type')),

          mapType: seq(literal('map'), sym('ws'), literal('<'),
              sym('keyType'),
              sym('ws'), literal(','), sym('ws'),
              sym('type'), sym('ws'), literal('>')),

          type: alt(
              sym('keyType'),
              literal('double'), literal('float'),
              literal('fixed32'), literal('fixed64'),
              literal('sfixed32'), literal('sfixed64'),
              literal('bytes'), sym('userType')),

          // These are the types that are allowed as map keys.
          keyType: alt(
              literal('int32'), literal('int64'),
              literal('uint32'), literal('uint64'),
              literal('sint32'), literal('sint64'),
              literal('bool'), literal('string')),

          // Leading dot for identifiers means they're fully qualified
          userType: seq(optional(literal('.')), sym('dottedIdents')),

          constant: alt(sym('ident'), sym('floatLit'), sym('sintLit'),
              sym('strLit'), sym('boolLit')),

          map: seq1(2, literal('{'), sym('ws'),
              repeat(sym('mapEntry'), sym('ws')),
              sym('ws'), literal('}')),

          mapEntry: seq(sym('ident'), sym('ws'), literal(':'), sym('ws'),
              sym('constant')),

          ident: seq(sym('a'), repeat(sym('w'))),

          dottedIdents: plus(sym('ident'), literal('.')),

          intLit: alt(sym('decInt'), sym('hexInt'), sym('octInt')),

          sign: alt(literal('+'), literal('-')),

          sintLit: alt(
            seq(sym('sign'), sym('decInt')),
            sym('intLit')),

          decInt: plus(sym('d')),

          hexInt: seq(literal('/0'), alt(literal('x'), literal('X')),
              plus(alt(range('A','F'), range('a', 'f'), range('0', '9')))),

          octInt: seq(literal('/0'), plus(range('0', '7'))),

          floatLit: seq(optional(sym('sign')), alt(
            seq(literal('.'), sym('decInt'), optional(sym('exponent'))),
            seq(sym('decInt'), sym('exponent')),
            seq(sym('decInt'), literal('.'), optional(sym('decInt')),
                optional(sym('exponent'))))),

          exponent: seq(literalIC('e'), optional(sym('sign')), sym('decInt')),

          boolLit: alt(literal('true'), literal('false')),

          strLit: alt(sym('doubleQuoteStrLit'), sym('singleQuoteStrLit')),

          doubleQuoteStrLit: seq(literal('"'),
              repeat(alt(sym('hexEscape'), sym('octEscape'), sym('charEscape'),
                  sym('doubleQuoteEscape'), not(literal('"'), anyChar()))),
              literal('"')),

          singleQuoteStrLit: seq(literal("'"),
              repeat(alt(sym('hexEscape'), sym('octEscape'), sym('charEscape'),
                  sym('singleQuoteEscape'), not(literal("'"), anyChar()))),
              literal("'")),

          hexEscape: seq(literalIC('\\x'), repeat(alt(range('A','F'),
                  range('a', 'f'), range('0', '9')), undefined, 1)),

          octEscape: seq(literal('\\0'),
              repeat(range('0', '7'), undefined, 1, 3)),

          charEscape: seq(literal('\\'), alt(literal('a'), literal('b'),
                literal('f'), literal('n'), literal('r'), literal('t'),
                literal('v'), literal('?'))),

          doubleQuoteEscape: seq('\\"'),
          singleQuoteEscape: seq("\\'")
        };
      }
    },
    {
      name: 'parser',
      factory: function() {
        var X = this.X;
        var g = this.ImperativeGrammar.create({ symbols: this.grammar_ });

        var self = this;

        g.addActions({
          package: function(a) {
            return { node: 'package', value: a[2] };
          },

          import: function(a) {
            // "import" [public ws] ws strLit ws semi
            return {
              node: 'import',
              value: a[3],
              public: (a[2] && a[2][0] === 'public') ? true : undefined
            };
          },

          enumField: function(a) {
            var obj = { node: 'enumfield', key: a[0], value: a[4] };
            if ( a[6] ) obj.options = a[6];
            return obj;
          },

          enum: function(a) {
            var fields = [];
            var options = [];

            // The fields are either [key, value] pairs or option nodes.
            a[6].forEach(function(v) {
              if ( v.node === 'enumfield' ) {
                fields.push(v);
              } else if ( v.node === 'option' ) {
                options.push(v);
              } else {
                throw 'Unknown enum contents!';
              }
            });

            var ret = {
              node: 'enum',
              name: a[2],
              fields: fields
            };
            if ( options.length ) ret.options = options;
            return ret;
          },

          option: function(a) {
            return a[2];
          },

          optionBody: function(a) {
            // a[0] is either a single string, or an array of strings.
            var name = Array.isArray(a[0]) ? a[0].join('.') : a[0];
            // a[1] is an array of extra .ident pairs.
            for ( var i = 0; i < a[1].length; i++ ) {
              name += '.' + a[1][i][3];
            }
            // a[2] is whitespace, a[3] is =, a[4] is whitespace.
            // a[5] is the constant.
            return {
              node: 'option',
              name: name,
              value: a[5]
            };
          },

          mapType: function(a) {
            var keyType = a[3];
            var valType = a[7];
            return { node: 'maptype', keyType: keyType, valueType: valType };
          },

          userType: function(a) {
            return (a[0] || '') + a[1];
          },

          field: function(a) {
            var field = {
              node: 'field',
              type: a[1],
              name: a[3],
              prototag: a[7],
              repeated: a[0] && a[0][0] === 'repeated' ? true : undefined
            };

            if ( a[9] ) {
              field.options = a[9];
            }
            return field;
          },

          oneof: function(a) {
            return {
              node: 'oneof',
              name: a[2],
              fields: a[6]
            };
          },

          reserved: function() { return null; },

          message: function(a) {
            var options = [];
            var subMessages = [];
            var fields = [];

            // Maps oneof names to a list of field names.
            var oneofMap = {};
            var body = a[4];
            for ( var i = 0; i < body.length; i++ ) {
              if ( ! body[i] ) continue;

              if ( body[i].node === 'field' ) {
                fields.push(body[i]);
              } else if ( body[i].node === 'enum' ||
                  body[i].node === 'message' ) {
                subMessages.push(body[i]);
              } else if ( body[i].node === 'option' ) {
                options.push(body[i]);
              } else if ( body[i].node === 'oneof' ) {
                // Hoist the oneof's fields to the top level.
                var names = [];
                for ( var j = 0; j < body[i].fields.length; j++ ) {
                  var f = body[i].fields[j];
                  f.oneof = body[i].name;
                  names.push(f.name);
                  fields.push(f);
                }
                // And record the oneof as a whole on the message.
                oneofMap[body[i].name] = names;
              }
            }

            var ret = {
              node: 'message',
              name: a[2]
            };

            if ( options.length ) ret.options = options;
            if ( fields.length ) ret.fields = fields;
            if ( subMessages.length ) ret.subMessages = subMessages;
            if ( Object.keys(oneofMap).length ) ret.oneofMap = oneofMap;
            return ret;
          },

          messageBody: function(a) { return a[2]; },

          extend: function(a) {
            return null;
          },

          service: function(a) {
            return {
              node: 'service',
              name: a[2],
              rpcs: a[6]
            };
          },

          rpc: function(a) {
            var ret = {
              node: 'rpc',
              name: a[2],
              requestType: a[6],
              responseType: a[14]
            };
            if ( Array.isArray(a[18]) ) ret.options = a[18];
            return ret;
          },

          mapEntry: function(a) {
            return [ a[0], a[4] ];
          },

          map: function(a) {
            var ret = {};
            for ( var i = 0; i < a.length; i++ ) {
              ret[a[i][0]] = a[i][1];
            }
            return ret;
          },

          ident: function(a) {
            var ret =  a[0] + a[1].join('');
            return ret;
          },

          dottedIdents: function(a) {
            return a.join('.');
          },

          decInt: function(a) { return parseInt(a.join('')); },

          sintLit: function(a) {
            // Either [sign, number] or just [number].
            if ( ! Array.isArray(a) ) {
              return a;
            }

            return a[0] === '-' ? -a[1] : a[1];
          },

          floatLit: function(a) {
            var negated = false;
            if ( a[0] && a[0] === '-' ) {
              negated = true;
            }

            a = a[1];
            // Several cases:
            // 1. '.' decInt opt(exponent)
            // 2. decInt exponent
            // 3. decInt '.' opt(decInt) opt(exponent)
            if ( a[0] === '.' ) { // Case 1, just a decimal part.
              if ( a[2] ) {
                return parseFloat('0.' + a[1] + 'e' + a[2].join(''));
              }
              return parseFloat('0.' + a[1]);
            } else if ( a[1] === '.' ) { // Case 3, all parts.
              var decPart = a[2] ? '.' + a[2] : '';
              var expPart = a[3] ? a[3].join('') : '';
              return parseFloat(a[0] + decPart + expPart);
            } else { // Case 2: dec exp
              return parseFloat(a[0] + a[1].join(''));
            }
          },

          strLit: function(a) {
            return a[1].join('');
          },

          hexEscape: function(a) {
            return parseInt(a[1].join(''), 16);
          },

          octEscape: function(a) {
            return parseInt(a[1].join(''), 8);
          },

          charEscape: function(a) {
            var map = {
              'a': '\a',
              'b': '\b',
              'f': '\f',
              'n': '\n',
              'r': '\r',
              't': '\t',
              'v': '\v',
              '?': '\?'
            };

            return map[a[1]];
          },

          quoteEscape: function() { return '"'; }
        });

        return g;
      }
    }
  ],

  methods: [
    function parseString(str, opt_start) {
      return this.parser.parseString(str, opt_start);
    }
  ]
});
