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
  package: 'foam.templates',
  name: 'TemplateOutput',

  documentation: 'A buffer for storing Template output.',

  properties: [
    {
      name: 'buf',
      factory: function() { return []; }
    }
  ],

  methods: [
    function output() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var o = arguments[i];

        if ( typeof o === 'object' ) {
          this.buf.push(o.toString());
        } else {
          this.buf.push(o);
        }
      }
    },

    function toString() {
      return this.buf.length == 0 ? '' :
        this.buf.length == 1 ? this.buf[0] :
        this.buf.join('');
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateUtil',

  documentation: 'Utility methods for working with Templates. Mostly just for internal use.',

  axioms: [ foam.pattern.Singleton.create() ],

  requires: [
    'foam.parse.ImperativeGrammar as Grammar',
    'foam.templates.TemplateOutput',
  ],

  constants: {
    HEADER: 'var self = this, ctx = this.__context__, Y = this.__subContext__;\n' +
      'var output = opt_outputter ? opt_outputter : TOC(this);\n' +
      'var out = output.output.bind(output);\n' +
      "out('",
    FOOTER: "');\nreturn opt_outputter ? output : output.toString();\n"
  },

  properties: [
    {
      name: 'grammar',
      factory: function() {
        var g = this.Grammar.create({
          symbols: function(repeat0, simpleAlt, sym, seq1, seq, repeat, notChars, anyChar, not, optional, literal) {
            return {
              START: sym('markup'),

              markup: repeat0(simpleAlt(
                sym('comment'),
                sym('simple value'),
                sym('raw values tag'),
                sym('code tag'),
                sym('ignored newline'),
                sym('newline'),
                sym('single quote'),
                sym('text')
              )),

              'comment': seq1(1, '<!--', repeat0(not('-->', anyChar())), '-->'),

              'simple value': seq('%%', repeat(notChars(' ()-"\r\n><:;,')), optional('()')),

              'raw values tag': simpleAlt(
                seq('<%=', repeat(not('%>', anyChar())), '%>')
              ),

              'code tag': seq('<%', repeat(not('%>', anyChar())), '%>'),
              'ignored newline': simpleAlt(
                literal('\\\r\\\n'),
                literal('\\\n')
              ),
              newline: simpleAlt(
                literal('\r\n'),
                literal('\n')
              ),
              'single quote': literal("'"),
              text: anyChar()
            }
          }
        });

        var self = this;

        g.addActions({
          markup: function(v) {
            var wasSimple = self.simple;
            var ret = wasSimple ? null : self.out.join('');
            self.out = [];
            self.simple = true;
            return [wasSimple, ret];
          },
          'simple value': function(v) {
            self.push("',\n self.",
                v[1].join(''),
                v[2],
                ",\n'");
          },
          'raw values tag': function (v) {
            self.push("',\n",
                v[1].join(''),
                ",\n'");
          },
          'code tag': function (v) {
            self.push("');\n",
                v[1].join(''),
                ";out('");
          },
          'single quote': function() {
            self.push("\\'");
          },
          newline: function() {
            self.push('\\n');
          },
          text: function(v) {
            self.pushSimple(v);
          }
        });
        return g;
      }
    },
    {
      name: 'out',
      factory: function() { return []; }
    },
    {
      name: 'simple',
      value: true
    }
  ],

  methods: [
    function push() {
      this.simple = false;
      this.pushSimple.apply(this, arguments);
    },

    function pushSimple() {
      this.out.push.apply(this.out, arguments);
    },

    function compile(t, name, args) {
      var result = this.grammar.parseString(t);
      if ( ! result ) throw "Error parsing template " + name;

      var code = this.HEADER +
          ( result[0] ? t : result[1] ) +
          this.FOOTER;

      var newArgs = ['opt_outputter'].concat(args.map(function(a) { return a.name || a }));
      var f = eval(
        '(function() { ' +
          'var TOC = function(o) { return foam.templates.TemplateOutput.create(); };' +
          'var f = function(' + newArgs.join(',') + '){' + code + '};' +
          'return function() { '+
          'if ( arguments.length && arguments[0] && ! arguments[0].output ) return f.apply(this, [undefined].concat(Array.from(arguments)));' +
          'return f.apply(this, arguments);};})()');

      return f;
    },

    function lazyCompile(t, name, args) {
      return (function(util) {
        var delegate;
        return function() {
          if ( ! delegate ) delegate = util.compile(t, name, args)
          return delegate.apply(this, arguments);
        };
      })(this);
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateAxiom',
  extends: 'Method',

  requires: [
    'foam.templates.TemplateUtil',
  ],

  properties: [
    {
      name: 'template',
      class: 'String'
    },
    { name: 'code', required: false },
    'args'
  ],

  methods: [
    function installInProto(proto) {
      proto[this.name] =
          foam.templates.TemplateUtil.create().lazyCompile(
              this.template, this.name, this.args || []);
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateExtension',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'templates',
      class: 'AxiomArray',
      of: 'foam.templates.TemplateAxiom',
      adaptArrayElement: function(o, prop) {
        return this.lookup(prop.of).create(o);
      }
    }
  ]
});
