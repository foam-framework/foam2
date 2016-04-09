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
  package: 'foam.parse',
  name: 'StringPS',

  properties: [
    {
      name: 'str',
      class: 'Simple'
    },
    {
      name: 'pos',
      class: 'Simple'
    },
    {
      name: 'head',
      getter: function() {
        return this.str[0][this.pos];
      }
    },
    {
      name: 'tail',
      getter: function() {
        if ( ! this.instance_.tail ) {
          var ps = this.cls_.create();
          ps.str = this.str;
          ps.pos = this.pos + 1;
          this.instance_.tail = ps;
        }
        return this.instance_.tail;
      },
      setter: function(value) {
        this.instance_.tail = value;
      }
    },
    {
      name: 'value',
      setter: function(value) { this.instance_.value = value; },
      getter: function() {
        return this.instance_.value !== undefined ?
          this.instance_.value :
          this.str[0].charAt(this.pos - 1);
      }
    }
  ],

  methods: [
    function initArgs() {},

    function setValue(value) {
      // Force undefined values to null so that hasOwnProperty checks are faster.
      if ( value === undefined ) value = null;
      var ps = this.cls_.create();
      ps.str = this.str;
      ps.pos = this.pos;
      ps.tail = this.tail;
      ps.value = value;
      return ps;
    },

    function setString(s) {
      if ( ! this.pos ) this.pos = 0;
      if ( ! this.str ) this.str = [];
      this.str[0] = s;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserArray',
  extends: 'Array',

  properties: [
    [ 'of', 'foam.parse.Parser' ],
    [ 'adapt', function(_, a, prop) {
        if ( ! a ) return [];
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ )
          b[i] = typeof a[i] === 'string' ?
              foam.parse.Literal.create({s: a[i]}) :
              a[i];
        return b;
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserProperty',
  extends: 'Property',

  properties: [
    {
      name: 'adapt',
      value: function(_, v) {
        return typeof v == 'string' ? foam.parse.Literal.create({ s: v }) : v;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserDecorator',

  properties: [
    {
      name: 'p',
      class: 'foam.parse.ParserProperty',
      final: true
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'State',

  properties: [
    {
      class: 'Simple',
      name: 'success'
    },
    {
      class: 'Simple',
      name: 'fail'
    },
    {
      class: 'Simple',
      name: 'ps'
    }
  ],

  methods: [
    {
      name: 'step'
    },
    function partialEval() {
      return this;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'BacktrackStart',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'restore',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],
  methods: [
    function step() {
      this.restore.ps = this.ps;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'BacktrackFinish',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    }
  ],
  methods: [
//    function step(pps) {
    //      pps[0] = this.ps;
    function step() {
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Placeholder',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    }
  ],
  methods: [
    //    function step(pps) {
    function step() {
      this.next.ps = this.ps;
      return this.next;
    },
    function partialEval() {
      return this.next.partialEval();
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Char',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'c',
      final: true
    }
  ],

  methods: [
    function step() {
      if ( this.ps.head === this.c ) {
        this.success.ps = this.ps.tail;
        return this.success;
      }
      this.fail.ps = this.ps;
      return this.fail;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'LiteralWithValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 's',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],
  methods: [
    function step() {
      var str = this.s;
      var ps = this.ps;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head ) {
          this.fail.ps = this.ps;
          return this.fail;
        }
      }
      this.success.ps = ps.setValue(this.value || str);
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Literal',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 's',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps1 = this.ps;
      var ps = this.ps;
      var str = this.s;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head ) {
          this.fail.ps = ps1;
          return this.fail;
        }
      }
      this.success.ps = ps;
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'AnyChar',
  extends: 'foam.parse.compiled.State',

  methods: [
    function step() {
            var ps = this.ps;
      if ( ps.head ) {
        this.success.ps = ps.tail;
        return this.success;
      }
      this.fail.ps = ps;
      return this.fail;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'ParserState',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'parser',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps = this.ps;
      var ret = this.parser.parse(ps);

      if ( ret ) {
        this.success.ps = ret;
        return this.success;
      }

      this.fail.ps = ps;
      return this.fail
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'Action',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'action',
      final: true
    }
  ],

  methods: [
    function step() {
      var ps = this.ps.setValue(this.action(this.ps.value));
      this.success.ps = ps;
      return this.success;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'GetValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function step() {
      this.value[0] = this.ps.value;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'SetValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'value',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
      function step() {
      var ps = this.ps.setValue(this.value[0]);
      this.next.ps = ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'StartValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'next',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],
  methods: [
    function step() {
      this.value.length = 0;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'AddValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'value',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      this.value.push(this.ps.value);
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'FinishValue',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'value',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step(pps) {
      pps[0] = pps[0].setValue(this.value);
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Literal',

  properties: [
    {
      name: 's',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      return withValue ?
        foam.parse.compiled.LiteralWithValue.create({
          s: this.s,
          value: this.value !== undefined ? this.value : this.s,
          success: success,
          fail: fail
        }) :
      foam.parse.compiled.LiteralWithValue.create({
        s: this.s,
        success: success,
        fail: fail
      })
    },
    function parse(ps, obj) {
      var str = this.s;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head ) return undefined;
      }
      return ps.setValue(this.value !== undefined ? this.value : str);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Alternate',

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var alt = [];
      var fails = []
      var args = this.args;

      for ( var i = 0 ; i < args.length ; i++ ) {
        fails[i] = foam.parse.compiled.Placeholder.create()
        alt[i] = args[i].compile(success, fails[i], withValue, grammar);
      }

      for ( var i = 0 ; i < alt.length ; i++ ) {
        fails[i].next = alt[i+1] || fail;
      }

      return alt[0];
    },
    function parse(ps, obj) {
      // TODO: Should we remove the obj argument in favour of
      // passing the obj along via context or something?
      var args = this.args;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        var ret = p.parse(ps, obj);
        if ( ret ) return ret;
      }
      return undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Sequence',

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var restore = foam.parse.compiled.BacktrackFinish.create({
        next: fail
      });
      var capture = foam.parse.compiled.BacktrackStart.create({
        restore: restore,
      });

      var value = [];

      var args = this.args;
      var successes = [];
      var seq = [];
      for ( var i = 0 ; i < args.length ; i++ ) {
        successes[i] = foam.parse.compiled.Placeholder.create();
        seq[i] = args[i].compile(
          withValue ?
            foam.parse.compiled.AddValue.create({ value: value, next: successes[i] }) :
            successes[i],
          restore,
          withValue,
          grammar);
      }

      success = withValue ?
        foam.parse.compiled.FinishValue.create({ value: value, next: success }) :
        success;

      for ( var i = 0 ; i < seq.length ; i++ ) {
        successes[i].next = seq[i+1] || success;
      }

      capture.next = seq[0];

      return withValue ?
        foam.parse.compiled.StartValue.create({ value: value, next: capture }) :
        capture;
    },
    function parse(ps, obj) {
      var ret = [];
      var args = this.args;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        if ( ! ( ps = p.parse(ps, obj) ) ) return undefined;
        ret.push(ps.value);
      }
      return ps.setValue(ret);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Sequence1',

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    },
    {
      name: 'n',
      final: true
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var restore = foam.parse.compiled.BacktrackFinish.create({
        next: fail
      });
      var capture = foam.parse.compiled.BacktrackStart.create({
        restore: restore,
      });

      var value = [];

      var args = this.args;
      var successes = [];
      var seq = [];
      for ( var i = 0 ; i < args.length ; i++ ) {
        successes[i] = foam.parse.compiled.Placeholder.create();
        seq[i] = args[i].compile(
          ( withValue && i == this.n ) ?
            foam.parse.compiled.GetValue.create({ value: value, next: successes[i] }) : successes[i],
          restore,
          withValue,
          grammar);
      }

      success = withValue ?
        foam.parse.compiled.SetValue.create({ value: value, next: success }) :
        success;

      for ( var i = 0 ; i < seq.length ; i++ ) {
        successes[i].next = seq[i+1] || success;
      }

      capture.next = seq[0];

      return capture;
    },
    function parse(ps, obj) {
      var ret;
      var args = this.args;
      var n = this.n
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        if ( ! ( ps = p.parse(ps, obj) ) ) return undefined;
        if ( i == n ) ret = ps.value;
      }
      return ps.setValue(ret);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Optional',
  extends: 'foam.parse.ParserDecorator',

  methods: [
    function compile(success, fail, withValue, grammar) {
      return this.p.compile(success, success, withValue, grammar);
    },
    function parse(ps, obj) {
      return this.p.parse(ps, obj) || ps.setValue(null);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'AnyChar',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function compile(success, fail) {
      return foam.parse.compiled.AnyChar.create({
        success: success,
        fail: fail
      });
    },
    function parse(ps, obj) {
      return ps.head ? ps.tail : undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'NotChars',

  properties: [
    {
      name: 'string',
      final: true
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      return foam.parse.compiled.ParserState.create({
        parser: this,
        success: success,
        fail: fail
      })
    },
    function parse(ps) {
      return ps.head && this.string.indexOf(ps.head) == -1 ?
        ps.tail : undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Repeat',
  extends: 'foam.parse.ParserDecorator',

  methods: [
    function compile(success, fail, withValue, grammar) {
      var value = [];
      var repeat = foam.parse.compiled.Placeholder.create();

      success = withValue ?
        foam.parse.compiled.FinishValue.create({ value: value, next: success }) :
        success;

      var p = this.p.compile(
        withValue ?
          foam.parse.compiled.AddValue.create({ value: value, next: repeat }) :
          repeat,
        success,
        withValue,
        grammar);

      repeat.next = p;

      return withValue ?
        foam.parse.compiled.StartValue.create({
          value: value,
          next: p
        }) :
        p;
    },
    function parse(ps, obj) {
      var ret = [];
      var p = this.p;
      while ( ps ) {
        var last = ps;
        ps = p.parse(ps, obj);
        if ( ps ) ret.push(ps.value);
      }
      return last.setValue(ret);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Repeat0',
  extends: 'foam.parse.Repeat',

  methods: [
    function compile(success, fail, withValue, grammar) {
      return this.SUPER(success, fail, false, grammar);
    },
    function parse(ps, obj) {
      var res;
      var p = this.p;
      while ( res = p.parse(ps, obj) ) ps = res;
      return ps.setValue('');
    }
  ]
});

foam.CLASS({
  package: 'foam.parse',
  name: 'Not',
  extends: 'foam.parse.ParserDecorator',

  properties: [
    {
      name: 'else',
      final: true,
      class: 'foam.parse.ParserProperty'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      var restore = foam.parse.compiled.BacktrackFinish.create({
        next: fail
      });

      var capture = foam.parse.compiled.BacktrackStart.create({
        restore: restore
      });

      var e = this.else ?
          this.else.compile(
            success,
            fail,
            withValue,
            grammar) :
          success;

      var delegate = this.p.compile(restore, e, false, grammar);
      capture.next = delegate;
      return capture;
    },
    function parse(ps, obj) {
      return this.p.parse(ps, obj) ?
        undefined :
        (this.else ? this.else.parse(ps, obj) : ps);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserWithAction',
  extends: 'foam.parse.ParserDecorator',

  properties: [
    'action'
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      success = foam.parse.compiled.Action.create({
        action: this.action,
        success: success,
      });
      return this.p.compile(success, fail, true, grammar);
    },
    function parse(ps, obj) {
      ps = this.p.parse(ps, obj);
      return ps ?
        ps.setValue(this.action(ps.value)) :
        undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserAxiom',
  extends: 'Method',

  properties: [
    'parser'
  ],

  methods: [
    function installInProto(proto) {
      var parser = this.parser;
      proto[this.name] = function(ps) {
        return parser.parse(ps, this);
      };
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Symbol',

  properties: [
    {
      name: 'name',
      final: true
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      return grammar.getSymbol(this.name).compile(
        success, fail, withValue, grammar);
    },
    function parse(ps, obj) {
      var p = obj[this.name];
      if ( ! p ) {
        console.error("No symbol found for", this.name);
        return undefined;
      }
      return p.call(obj, ps);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Parsers',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function seq() {
      return foam.lookup('foam.parse.Sequence').create({
        args: foam.array.argsToArray(arguments)
      });
    },

    function repeat0(p) {
      return foam.lookup('foam.parse.Repeat0').create({
        p: p
      });
    },

    function simpleAlt() {
      return foam.lookup('foam.parse.Alternate').create({
        args: foam.array.argsToArray(arguments)
      });
    },

    function alt() {
      return foam.lookup('foam.parse.Alternate').create({
        args: foam.array.argsToArray(arguments)
      });
    },

    function sym(name) {
      return foam.lookup('foam.parse.Symbol').create({
        name: name
      });
    },

    function seq1(n) {
      return foam.lookup('foam.parse.Sequence1').create({
        n: n,
        args: foam.array.argsToArray(arguments).slice(1)
      });
    },

    function repeat(p) {
      return foam.lookup('foam.parse.Repeat').create({
        p: p
      });
    },

    function notChars(s) {
      return foam.lookup('foam.parse.NotChars').create({
        string: s
      });
    },

    function not(p, opt_else) {
      return foam.lookup('foam.parse.Not').create({
        p: p,
        else: opt_else
      });
    },

    function optional(p) {
      return foam.lookup('foam.parse.Optional').create({
        p: p,
      });
    },

    function literal(s, value) {
      return foam.lookup('foam.parse.Literal').create({
        s: s,
        value: value
      });
    },

    function anyChar() {
      return foam.parse.AnyChar.create();
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParsersAxiom',
  extends: 'AxiomArray',

  requires: [
    'foam.pattern.With',
    'foam.parse.Parsers'
  ],

  properties: [
    [ 'of', 'foam.parse.ParserAxiom' ],
    {
      name: 'adapt',
      value: function(_, o, prop) {
        if ( Array.isArray(o) ) return o;

        if ( typeof o === "function" ) {
          var args = o.toString().match(/\((.*?)\)/);
          if ( ! args ) {
            throw "Could not parse arguments from parser factory function";
          }

          o = prop.With.create().with(o, prop.Parsers.create());
        }

        var a = [];
        for ( var key in o ) {
          a.push(foam.lookup('foam.parse.ParserAxiom').create({
            name: key,
            parser: o[key]
          }));
        }
        return a;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserAxioms',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'grammar',
      class: 'foam.parse.ParsersAxiom'
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserAction',
  extends: 'foam.core.Method',

  methods: [
    function installInProto(proto) {
      var f      = this.code;
      var name   = this.name;
      var parser = proto[this.name];

      if ( ! parser )
        throw "No existing parser found for " + this.name;

      proto[this.name] = function(ps, grammar) {
        ps = parser.call(this, ps, grammar);
        return ps ? ps.setValue(f.call(this, ps.value)) : null;
      };
    }
  ]
});


/** Supports parser ParserActions */
foam.CLASS({
  package: 'foam.parse',
  name: 'ParseAction',
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'foam.parse.ParserAction',
      name: 'grammarActions',
      adaptArrayElement: function(o) {
        if ( foam.lookup(this.of).isInstance(o) ) return o;
        return foam.lookup(this.of).create({
          name: o.name,
          code: typeof o === 'function' ? o : o.code
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'PSymbol',

  properties: [ 'name', 'parser' ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Grammar',

  requires: [
    'foam.parse.StringPS'
  ],

  properties: [
    {
      class: 'Array',
      of: 'foam.parse.PSymbol',
      name: 'symbols',
      adapt: function(_, o) {
        if ( Array.isArray(o) ) return o;

        if ( typeof o === "function" ) {
          var args = o.toString().match(/\((.*?)\)/);
          if ( ! args ) {
            throw "Could not parse arguments from parser factory function";
          }

          o = foam.pattern.With.create().with(o, foam.parse.Parsers.create());
        }

        var a = [];
        for ( var key in o ) {
          a.push(foam.parse.PSymbol.create({
            name: key,
            parser: o[key]
          }));
        }
        return a;
      }
    },
    {
      name: 'symbolMap_',
      expression: function(symbols) {
        var m = {};
        for ( var i = 0 ; i < symbols.length ; i++ ) {
          m[symbols[i].name] = symbols[i];
        }
        return m;
      }
    },
    {
      name: 'finish_success',
      factory: function() {
        return {};
      }
    },
    {
      name: 'finish_fail',
      factory: function() {
        return {};
      }
    },
    {
      name: 'compiled',
      expression: function(symbolMap_) {
        return symbolMap_['START'].parser.compile(
          this.finish_success,
          this.finish_fail,
          false,
          this);
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
    function parseString(str) {
      this.ps.setString(str);
      var state = this.compiled;
      state.ps = this.ps;
      var success = this.finish_success;
      var fail = this.finish_fail;
      return this.parse(this.ps, state, success, fail);
    },
    function parse(ps, state, success, fail) {
      while ( state != success && state != fail ) {
        state = state.step();
      }
      if ( state == success ) return state.ps.value;
    },
    function getSymbol(name) {
      return this.symbolMap_[name].parser;
    },
    function addActions(map) {
      for ( var key in map ) {
        this.addAction(key, map[key]);
      }
      return this;
    },
    function addAction(name, action) {
      for ( var i = 0 ; i < this.symbols.length ; i++ ) {
        if ( this.symbols[i].name == name ) {
          this.symbols[i].parser = foam.parse.ParserWithAction.create({
            p: this.symbols[i].parser,
            action: action
          });
        }
      }

      // TODO: Array property should help me here
      this.pub("propertyChange", "symbols", this.slot("symbols"));
      return this;
    }
  ]
});

/*
TODO:
-detect non string values passed to StringPS.setString()

*/
