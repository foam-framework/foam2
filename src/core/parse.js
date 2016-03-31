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
})


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserProperty',
  extends: 'Property',

  properties: [
    {
      name: 'adapt',
      defaultValue: function(_, v) { return typeof v == 'string' ? foam.parse.Literal.create({ s: v }) : v }
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
  extends: 'foam.parse.ParserDecorator',

  methods: [
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
    function parse(ps, obj) {
      return this.p.parse(ps, obj) ?
        undefined :
        (this.else ? this.else.parse(ps, obj) : ps);
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
  name: 'ParsersAxiom',
  extends: 'AxiomArray',

  properties: [
    [ 'of', 'foam.parse.ParserAxiom' ],
    {
      name: "anyChar",
      getter: function() { return foam.parse.AnyChar.create(); }
    },
    {
      name: 'adapt',
      defaultValue: function(_, o, prop) {
        if ( Array.isArray(o) ) return o;

        if ( typeof o === "function" ) {
          var args = o.toString().match(/\((.*?)\)/);
          if ( ! args ) {
            throw "Could not parse arguments from parser factory function";
          }

          args = args[1].split(",").map(function(a) { return a.trim(); });
          for ( var i = 0 ; i < args.length; i++ ) {
            if ( prop[args[i]] ) args[i] = prop[args[i]];
            else {
              var cls = foam.lookup(args[i]) || foam.lookup('foam.parse.' + args[i]);
              if ( ! cls ) {
                throw "Could not find class for " + args[i];
              }

              args[i] = (function(cls) {
                return function(args) {
                  return cls.create(args);
                };
              })();
            }
          }

          o = o.apply(null, args);
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
  ],

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

/*
TODO:
-detect non string values passed to StringPS.setString()

*/
