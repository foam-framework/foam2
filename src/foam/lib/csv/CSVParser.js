/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'CSVParser',
  
  requires: [
    'foam.parse.ImperativeGrammar'
  ],

  properties: [
    {
      name: 'grammar_',
      value: function(alt, anyChar, literal, literalIC, not, notChars, optional,
          plus, range, repeat, repeat0, seq, seq1, str, sym) {
        return {
          START: seq1(1, sym('ws'), repeat(sym('field'), ','), sym('ws')),

          field: alt(sym('quotedText'), sym('unquotedText'), ''),

          unquotedText: repeat(not(',', anyChar()), '', 1),

          quotedText: seq1(1, '"', repeat(alt(sym('escapedQuote'), not('"', anyChar()))), '"'),

          escapedQuote: '""',

          white: alt(' ', '\t', '\r', '\n'),

          // 0 or more whitespace characters.
          ws: repeat0(sym('white')),
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
          unquotedText: function(a) {
            return { node: 'unquotedText', value: a.join('') };
          },

          quotedText: function(a) {
            return { node: 'quotedText', value: a.join('') };
          },

          escapedQuote: function() { return '"'; }
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
