/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.parsers.html',
  name: 'HTMLLexer',

  documentation: `Parse an HTML string into a flat sequence of tags and
      strings.`,

  requires: [
    'foam.parse.ImperativeGrammar',
    'foam.parse.Parsers',
    'foam.parse.StringPStream',
    'foam.parsers.html.Attribute',
    'foam.parsers.html.Tag',
    'foam.parsers.html.TagType'
  ],

  axioms: [
    foam.pattern.Singleton.create()
  ],

  properties: [
    {
      name: 'lib',
      factory: function() { return foam.parsers.html; }
    },
    {
      name: 'symbolsFactory',
      value: function(
          seq1, sym, seq, repeat, alt, optional, str, plus, notChars, repeat0,
          not, anyChar, range, literalIC) {

        return {
          START: seq1(1, optional(sym('header')), sym('html')),

          html: repeat(sym('htmlPart')),

          htmlPart: alt(
              sym('cdata'),
              sym('comment'),
              sym('closeTag'),
              sym('openTag'),
              sym('text')),

          openTag: seq(
              '<',
              sym('tagName'),
              sym('whitespace'),
              sym('attributes'),
              sym('whitespace'),
              optional('/'),
              '>'),

          closeTag: seq1(1,
                       '</',
                       sym('tagName'),
                       sym('whitespace'),
                       '>'),

          header: seq(
            sym('whitespace'),
            optional(sym('langTag')),
            sym('whitespace'),
            optional(sym('doctype')),
            sym('whitespace')),

          langTag: seq('<?', repeat0(notChars('?')), '?>'),

          doctype: seq('<!', literalIC('DOCTYPE'), sym('whitespace'),
                       repeat0(sym('doctypePart')), '>'),

          doctypePart: alt(plus(notChars('[>', anyChar())),
                           seq('[', repeat0(notChars(']', anyChar())), ']')),

          cdata: seq1(1,
                      '<![CDATA[', str(repeat(not(']]>', anyChar()))), ']]>'),

          comment: seq('<!--', repeat0(not('-->', anyChar())), '-->'),

          attributes: repeat(sym('attribute'), sym('whitespace')),

          label: str(plus(notChars(' =/\t\r\n<>'))),

          tagName: sym('label'),

          text: str(plus(not(alt(sym('closeTag'), sym('openTag')),
                  anyChar()))),

          attribute: seq(sym('label'), optional(
              seq1(3, sym('whitespace'), '=', sym('whitespace'),
                   sym('value')))),

          value: str(alt(
              plus(notChars('\'" \t\r\n<>')),
              seq1(1, '"', repeat(notChars('"', anyChar())), '"'),
              seq1(1, "'", repeat(notChars("'", anyChar())), "'"))),

          whitespace: repeat0(alt(' ', '\t', '\r', '\n'))
        };
      }
    },
    {
      name: 'symbols',
      factory: function() {
        return foam.Function.withArgs(
          this.symbolsFactory,
          this.Parsers.create(),
          this
        );
      }
    },
    {
      name: 'actions',
      factory: function() {
        var self  = this;
        var lib   = self.lib;
        var Tag   = self.Tag;
        var Attribute = self.Attribute;
        var OPEN  = self.TagType.OPEN;
        var CLOSE = self.TagType.CLOSE;
        var OPEN_CLOSE = self.TagType.OPEN_CLOSE;

        return {
          openTag: function(v) {
            return Tag.create({
              type: v[5] || lib.isSelfClosing(v[1]) ? OPEN_CLOSE : OPEN,
              nodeName: v[1],
              attributes: v[3],
            });
          },

          closeTag: function(v) {
            return Tag.create({ type: CLOSE, nodeName: v });
          },

          // TODO(markdittmer): Do something with these values.
          header: function(v) { return null; },
          langTag: function(v) { return null; },
          doctype: function(v) { return null; },
          doctypePart: function(v) { return null; },
          cdata: function(v) { return null; },
          comment: function(v) { return null; },
          attribute: function(v) {
            return Attribute.create({ name: v[0], value: v[1] || null });
          },
        };
      }
    },
    {
      name: 'grammar',
      factory: function() {
        var grammar = this.ImperativeGrammar.create({symbols: this.symbols});
        grammar.addActions(this.actions);
        return grammar;
      }
    },
    {
      name: 'ps',
      factory: function() {
        return this.StringPStream.create();
      }
    }
  ],

  methods: [
    function parseString(str, opt_name) {
      opt_name = opt_name || 'START';

      this.ps.setString(str);
      var start = this.grammar.getSymbol(opt_name);
      foam.assert(start, 'No symbol found for', opt_name);

      return start.parse(this.ps, this.grammar);
    }
  ]
});
