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
      class: 'String',
      name: 'delimiter'
    },
    {
      class: 'String',
      name: 'nestedObjectSeperator'
    },
    {
      name: 'stringParser',
      factory: function() {
        var X = this.X;
        var self = this;
        
        return this.ImperativeGrammar.create({ 
          symbols: function(alt, anyChar, literal, literalIC, not, notChars, optional,
          plus, range, repeat, repeat0, seq, seq1, str, sym) {
            return {

              START: seq1(1, sym('ws'), repeat(sym('field'), literal(self.delimiter)), sym('ws')),

              field: alt(sym('quotedText'), sym('unquotedText'), ''),

              unquotedText: repeat(not(literal(self.delimiter), anyChar()), '', 1),

              quotedText: seq1(1, '"', repeat(alt(sym('escapedQuote'), not('"', anyChar()))), '"'),

              escapedQuote: '""',

              white: alt(' ', '\t', '\r', '\n'),

              // 0 or more whitespace characters.
              ws: repeat0(sym('white'))
            }
          }
        }).addActions({
          unquotedText: function(a) {
            return { node: 'unquotedText', value: a.join('') };
          },

          quotedText: function(a) {
            return { node: 'quotedText', value: a.join('') };
          },

          escapedQuote: function() { return '"'; }
        });
      }
    },
    {
      name: 'headerParser',
      factory: function() {
        var X = this.X;
        var self = this;
        
        return this.ImperativeGrammar.create({ 
          symbols: function(alt, anyChar, literal, literalIC, not, notChars, optional,
          plus, range, repeat, repeat0, seq, seq1, str, sym) {
            return {

              START: seq1(1, sym('ws'), repeat(sym('field'), literal(self.nestedObjectSeperator)), sym('ws')),

              field: alt(sym('text'), ''),

              text: repeat(alt(sym('escapedSeperator'), not(self.nestedObjectSeperator, anyChar())), '', 1),

              escapedSeperator: literal(self.nestedObjectSeperator + self.nestedObjectSeperator),

              white: alt(' ', '\t', '\r', '\n'),

              // 0 or more whitespace characters.
              ws: repeat0(sym('white'))
            }
          }
        }).addActions({
          text: function(a) {
            return { node: 'text', value: self.recoverHeaderTitle(a.join('')) };
          },

          escapedQuote: function() { return '"'; }
        });
      }
    }
  ],

  methods: [
    function parseString(str, delimiter) {
      this.delimiter = delimiter;
      return this.stringParser.parseString(str);
    },
    
    function parseHeader(str, nestedObjectSeperator) {
      this.nestedObjectSeperator = nestedObjectSeperator;
      return this.headerParser.parseString(str);
    },

    function recoverHeaderTitle(t) {
      // Recovers header title by replacing the nested object seperator x 2, by itself
      return t.replace(new RegExp(this.nestedObjectSeperator + this.nestedObjectSeperator, 'g'), 
                this.nestedObjectSeperator);
    }
  ]
});
