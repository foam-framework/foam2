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

foam.ENUM({
  package: 'foam.parsers',
  name: 'TagType',

  values: [
    { name: 'OPEN', label: 'Open' },
    { name: 'CLOSE', label: 'Close' }
  ]
});

foam.CLASS({
  package: 'foam.parsers',
  name: 'Tag',

  properties: [
    {
      class: 'Enum',
      of: 'foam.parsers.TagType',
      name: 'type',
      factory: function() { return foam.parser.TagType.OPEN; }
    },
    {
      class: 'String',
      name: 'nodeName',
      value: 'div'
    },
  ]
});

foam.CLASS({
  package: 'foam.parsers',
  name: 'HTMLParser',

  documentation: 'Parse an HTML string.',

  requires: [
    'foam.parse.ImperativeGrammar',
    'foam.parse.Parsers',
    'foam.parse.StringPS'
  ],

  axioms: [
    foam.pattern.Singleton.create()
  ],

  properties: [
    {
      name: 'symbolsFactory',
      value: function(
          seq1, sym, seq, repeat, alt, optional, str, plus, notChars, repeat0,
          not, anyChar, range) {
        var startTag = this.startTag_.bind(this, seq, sym);
        var endTag = this.endTag_.bind(this, seq, sym);

        return {
          START: sym('html'),

          html: seq(optional('doctype'), repeat(sym('htmlPart'))),

          htmlPart: alt(
              sym('cdata'),
              sym('comment'),
              sym('text'),

              // "embed" is specific tag types; must come before "startTag".
              sym('embed'),

              sym('endTag'),
              sym('startTag')),

          startTag: seq(
              '<',
              sym('whitespace'),
              sym('tagName'),
              sym('whitespace'),
              sym('attributes'),
              sym('whitespace'),
              optional('/'),
              sym('whitespace'),
              '>'),

          endTag: seq1(4,
                       '<',
                       sym('whitespace'),
                       '/',
                       sym('tagName'),
                       sym('whitespace'),
                       '>'),

          doctype: seq('<!DOCTYPE', sym('whitespace'),
                       repeat0(sym('doctypePart')), '>'),

          doctypePart: alt(plus(notChars('[>', anyChar())),
                           seq('[', repeat0(notChars(']', anyChar())), ']')),

          cdata: seq1(1,
                      '<![CDATA[', str(repeat(not(']]>', anyChar()))), ']]>'),

          comment: seq('<!--', repeat0(not('-->', anyChar())), '-->'),

          attributes: repeat(sym('attribute'), sym('whitespace')),

          label: str(plus(notChars(' =/\t\r\n<>'))),

          tagName: sym('label'),

          text: str(plus(alt(sym('escape'), notChars('<')))),

          escape: str(seq('&', str(repeat(range('a', 'z'))), ';')),

          attribute: seq(sym('label'), optional(
              seq1(3, sym('whitespace'), '=', sym('whitespace'),
                   sym('value')))),

          value: str(alt(
              plus(alt(
                  range('a', 'z'),
                  range('A', 'Z'),
                  range('0', '9'))),
              seq1(1, '"', repeat(notChars('"', anyChar())), '"'),
              seq1(1, "'", repeat(notChars("'", anyChar())), "'"))),

          embed: alt(sym('script'), sym('style')),

          script: seq1(1,
                       startTag('script'),
                       str(repeat(not(endTag('script'), anyChar()))),
                       endTag('script')),

          style: seq1(1,
                      startTag('style'),
                      str(repeat(not(endTag('style'), anyChar()))),
                      endTag('style')),

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
      },
    },
    {
      name: 'actions',
      factory: function() {
        return {
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
        return this.StringPS.create();
      },
    },
  ],

  methods: [
    function parseString(str, opt_name) {
      opt_name = opt_name || 'START';

      this.ps.setString(str);
      var start = this.grammar.getSymbol(opt_name);
      foam.assert(start, 'No symbol found for', opt_name);

      return start.parse(this.ps, this.grammar);
    },
    function startTag_(seq, sym, tagName) {
      return seq(
          '<',
          sym('whitespace'),
          tagName,
          sym('whitespace'),
          sym('attributes'),
          sym('whitespace'),
          '>');
    },
    function endTag_(seq, sym, tagName) {
      return seq(
          '<',
          sym('whitespace'),
          '/',
          sym('whitespace'),
          tagName,
          sym('whitespace'),
          '>');
    }
  ]
});
