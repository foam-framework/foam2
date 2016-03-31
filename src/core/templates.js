/*
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
  axioms: [foam.pattern.Singleton.create()],
  requires: [
    'foam.parse.StringPS'
  ],

  constants: {
    HEADER: 'var self = this, X = this.X, Y = this.Y;\n' +
      'var output = opt_outputter ? opt_outputter : TOC(this);\n' +
      'var out = output.output.bind(output);\n' +
      "out('",
    FOOTER: "');\nreturn opt_outputter ? output : output.toString();\n"
  },

  grammar: function(repeat0, simpleAlt, sym, seq1, seq, repeat, notChars, anyChar, not, optional, literal) {
    return {
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

      'comment': seq1(1, '<!--', repeat0(not('-->', anyChar)), '-->'),


      'simple value': seq('%%', repeat(notChars(' ()-"\r\n><:;,')), optional('()')),

      'raw values tag': simpleAlt(
        seq('<%=', repeat(not('%>', anyChar)), '%>')
      ),

      'code tag': seq('<%', repeat(not('%>', anyChar)), '%>'),
      'ignored newline': simpleAlt(
        literal('\\\r\\\n'),
        literal('\\\n')
      ),
      newline: simpleAlt(
        literal('\r\n'),
        literal('\n')
      ),
      'single quote': literal("'"),
      text: anyChar
    };
  },

  properties: [
    {
      name: 'out',
      factory: function() { return []; }
    },
    {
      name: 'simple',
      defaultValue: true
    },
    {
      name: 'ps',
      factory: function() {
        return this.StringPS.create();
      }
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
      this.ps.setString(t);
      var result = this.markup(this.ps);
      if ( ! result ) {
        throw "Error parsing template " + name;
      }
      result = result.value;

      var code = this.HEADER +
          ( result[0] ? t : result[1] )
          + this.FOOTER;

      var args = ['opt_outputter'].concat(args);
      var f = eval(
        '(function() { ' +
          'var TOC = function(o) { return foam.templates.TemplateOutput.create(); };' +
          'var f = function(' + args.join(',') + '){' + code + '};' +
          'return function() { '+
          'if ( arguments.length && arguments[0] && ! arguments[0].output ) return f.apply(this, [undefined].concat(foam.array.argsToArray(arguments)));' +
          'return f.apply(this, arguments);};})()');

      return f;
    },

    function lazyCompile(t, name, args) {
      return (function(util) {
        var delegate;
        return function() {
          if ( ! delegate ) {
            delegate = util.compile(t, name, args)
          }
          return delegate.apply(this, arguments);
        };
      })(this);
    }
  ],

  grammarActions: [
    function markup (v) {
      var wasSimple = this.simple;
      var ret = wasSimple ? null : this.out.join('');
      this.out = [];
      this.simple = true;
      return [wasSimple, ret];
    },
    {
      name: 'simple value',
      code: function(v) {
        this.push("',\n self.",
                  v[1].join(''),
                  v[2],
                  ",\n'");
      },
    },
    {
      name: 'raw values tag',
      code: function (v) {
        this.push("',\n",
                  v[1].join(''),
                  ",\n'");
      },
    },
    {
      name: 'code tag',
      code: function (v) {
        this.push("');\n",
                  v[1].join(''),
                  ";out('");
      },
    },
    {
      name: 'single quote',
      code: function () {
        this.pushSimple("\\'");
      },
    },
    function newline() {
      this.pushSimple('\\n');
    },
    function text(v) {
      this.pushSimple(v);
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateAxiom',
  extends: 'Method',

  properties: [
    'name',
    {
      name: 'template',
      class: 'String'
    },
    'args'
  ],

  methods: [
    function installInProto(proto) {
      proto[this.name] =
        foam.templates.TemplateUtil.create().lazyCompile(this.template, this.name, this.args || []);
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
      adaptArrayElement: function(o) {
        return foam.lookup(this.of).create(o);
      }
    }
  ]
});
