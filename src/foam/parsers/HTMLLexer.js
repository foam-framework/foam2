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
    { name: 'OPEN',       label: 'Open' },
    { name: 'CLOSE',      label: 'Close' },
    { name: 'OPEN_CLOSE', label: 'Open & Close' }
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
    }
    // TODO(markdittmer): Add attributes.
  ]
});


foam.CLASS({
  package: 'foam.parsers',
  name: 'Embed',
  extends: 'foam.parsers.Tag',

  properties: [
    {
      name: 'type',
      factory: function() { return foam.parser.TagType.OPEN_CLOSE; }
    },
    'content'
  ]

});


foam.CLASS({
  package: 'foam.parsers',
  name: 'HTMLLexer',

  documentation: `Parse an HTML string into a flat sequence of tags and
      strings.`,

  requires: [
    'foam.parse.ImperativeGrammar',
    'foam.parse.Parsers',
    'foam.parse.StringPS',
    'foam.parsers.Embed',
    'foam.parsers.Tag',
    'foam.parsers.TagType'
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
        var openTag = this.openTag_.bind(this, seq, sym);
        var closeTag = this.closeTag_.bind(this, seq, sym);

        return {
          START: seq1(1, optional(sym('header')), sym('html')),

          html: repeat(sym('htmlPart')),

          htmlPart: alt(
              sym('cdata'),
              sym('comment'),
              sym('text'),

              // "embed" is specific tag types; must come before "openTag".
              sym('embed'),
              sym('maybeEmbed'),

              sym('closeTag'),
              sym('openTag')),

          openTag: seq(
              '<',
              sym('whitespace'),
              sym('tagName'),
              sym('whitespace'),
              sym('attributes'),
              sym('whitespace'),
              optional('/'),
              sym('whitespace'),
              '>'),

          closeTag: seq1(3,
                       '<',
                       sym('whitespace'),
                       '/',
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

          text: str(plus(alt(sym('escape'), notChars('<')))),

          escape: str(seq1(1, '&', repeat(range('a', 'z')), ';')),

          attribute: seq(sym('label'), optional(
              seq1(3, sym('whitespace'), '=', sym('whitespace'),
                   sym('value')))),

          value: str(alt(
              plus(notChars('\'" \t\r\n<>')),
              // TODO(markdittmer): Support proper escaping inside strings.
              seq1(1, '"', repeat(notChars('"', anyChar())), '"'),
              seq1(1, "'", repeat(notChars("'", anyChar())), "'"))),

          embed: alt(sym('script'), sym('style'), sym('xmp')),

          maybeEmbed: alt(sym('pre'), sym('code')),

          script: seq(
              openTag('script'),
              str(repeat(not(closeTag('script'), anyChar()))),
              closeTag('script')),

          style: seq(
              openTag('style'),
              str(repeat(not(closeTag('style'), anyChar()))),
              closeTag('style')),

          xmp: seq(
              openTag('xmp'),
              str(repeat(not(closeTag('xmp'), anyChar()))),
              closeTag('xmp')),

          pre: seq(
              openTag('pre'),
              str(repeat(not(closeTag('pre'), anyChar()))),
              closeTag('pre')),

          code: seq(
              openTag('code'),
              str(repeat(not(closeTag('code'), anyChar()))),
              closeTag('code')),

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
        var Embed = self.Embed;
        var OPEN  = self.TagType.OPEN;
        var CLOSE = self.TagType.CLOSE;
        var OPEN_CLOSE = self.TagType.OPEN_CLOSE;

        return {
          openTag: function(v) {
            // TODO(markdittmer): Add attributes.
            return Tag.create({
              type: v[6] || lib.isSelfClosing(v[2]) ? OPEN_CLOSE : OPEN,
              nodeName: v[2]
            });
          },

          closeTag: function(v) {
            return Tag.create({ type: CLOSE, nodeName: v });
          },

          escape: function(v) {
            var char = lib.getHtmlEscapeChar(v);
            if ( char || typeof char === 'string' ) return char;
            return '&' + v + ';';
          },

          embed: function(v) {
            // v = [
            //   deconstructed open tag,
            //   content string,
            //   deconstructed close tag
            // ]
            return Embed.create({ nodeName: v[0][2], content: [ v[1] ] });
          },

          maybeEmbed: function(v) {
            // v = [
            //   deconstructed open tag,
            //   content string,
            //   deconstructed close tag
            // ]
            var nodeName = v[0][2];
            var str = v[1];
            var ret = Embed.create({ nodeName: nodeName });

            // Attempt to parse maybeEmbeds. Returns "html" parse or string.
            var ps = self.StringPS.create();
            ps.setString(str);
            var start  = self.grammar.getSymbol('html');
            var result = start.parse(ps, self.grammar);
            ret.content = ( result && result.value && result.pos === str.length ) ?
                result.value :
                [ str ];
            return ret;
          },

          // TODO(markdittmer): Do something with these values.
          header: function(v) { return null; },
          langTag: function(v) { return null; },
          doctype: function(v) { return null; },
          doctypePart: function(v) { return null; },
          cdata: function(v) { return null; },
          comment: function(v) { return null; },
          attributes: function(v) { return null; },
          attribute: function(v) { return null; },
          value: function(v) { return null; }
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
    },

    function openTag_(seq, sym, tagName) {
      return seq(
          '<',
          sym('whitespace'),
          tagName,
          sym('whitespace'),
          sym('attributes'),
          sym('whitespace'),
          '>');
    },

    function closeTag_(seq, sym, tagName) {
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
