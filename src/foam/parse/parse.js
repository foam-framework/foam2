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

/**
  Parse combinator library.

  Create complex parsers by composing simple parsers.

  A PStream is a "Parser Stream", the input format accepted by
  FOAM parsers.

  PStreams have the following interface:
    get int     pos   - The character position in the input stream.

    get Char    head  - The first character in the stream.

    get PStream tail  - A PStream for the next position in the input steam.

    get Object  value - 'Value' associated with this PStream.

    PStream setValue(Object value) - Create a new PStream at the same position
        but with a new 'value'. The value is used to hold the result of a
        (sub-)parse.

  PStreams are immutable, which greatly simplifies backtracking.

  A parser has the following interface:
    PStream parse(PStream stream);

  It takes as input a PStream, and returns either a PStream
  advanced to the point after all input consumed by the parser,
  or undefined if the parse failed. The value generated by the parser
  is stored in the .value property of the returned PStream.
 */
foam.CLASS({
  package: 'foam.parse',
  name: 'StringPStream',

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
      name: 'valid',
      getter: function() {
        return this.pos <= this.str[0].length;
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
    },

    function substring(end) {
      foam.assert(this.str === end.str &&
                  end.pos >= this.pos,
                  'Cannot make substring: end PStream is not a tail of this.');

      return this.str[0].substring(this.pos, end.pos);
    },

    function apply(p, obj) {
      return p.parse(this, obj);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'ParserArray',
  extends: 'FObjectArray',

  properties: [
    ['of', 'foam.parse.Parser'],
    ['adapt', function(_, a) {
        if ( ! a ) return [];
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = typeof a[i] === 'string' ?
              foam.parse.Literal.create({s: a[i]}) :
              a[i];
        }
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
        return typeof v === 'string' ? foam.parse.Literal.create({s: v}) : v;
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
  ],

  methods: [
    function toString() { return this.p.toString(); }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Literal',

  documentation: 'Matches a literal with the parse stream (case sensitive)',

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
    function parse(ps) {
      var str = this.s;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head ) {
          return undefined;
        }
      }
      return ps.setValue(this.value !== undefined ? this.value : str);
    },

    function toString() {
      return '"' + this.s + '"';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'LiteralIC',

  documentation: 'Matches a literal with the parse stream (case insensitive)',

  properties: [
    {
      name: 's',
      final: true,
      postSet: function(old, nu) {
        this.lower = nu.toLowerCase();
      }
    },
    {
      name: 'lower',
      final: true
    },
    {
      name: 'value',
      final: true
    }
  ],

  methods: [
    function parse(ps) {
      var str = this.lower;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( ! ps.head || str.charAt(i) !== ps.head.toLowerCase() ) {
          return undefined;
        }
      }
      return ps.setValue(this.value !== undefined ? this.value : this.s);
    },

    function toString() {
      return 'ignoreCase("' + this.lower + '")';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Alternate',

  documentation: 'Attempts to match one of the parser properties to the parse stream.',

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    }
  ],

  methods: [
    function parse(ps, obj) {
      // TODO(adamvy): Should we remove the obj argument in favour of
      // passing the obj along via context or something?
      var args = this.args;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        var ret = ps.apply(p, obj);
        if ( ret ) return ret;
      }
      return undefined;
    },

    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) {
        strs[i] = args[i].toString();
      }
      return 'alt(' + strs.join(', ') + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Sequence',

  documentation: 'Parses the parser properties sequentially.',

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
        if ( ! ( ps = ps.apply(p, obj) ) ) return undefined;
        ret.push(ps.value);
      }
      return ps.setValue(ret);
    },

    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) {
        strs[i] = args[i].toString();
      }
      return 'seq(' + strs.join(', ') + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'String',
  extends: 'foam.parse.ParserDecorator',
  methods: [
    function parse(ps, obj) {
      ps = ps.apply(this.p, obj);
      return ps ? ps.setValue(ps.value.join('')) : undefined;
    },

    function toString() {
      return 'str(' + this.SUPER() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Substring',
  extends: 'foam.parse.ParserDecorator',
  methods: [
    function parse(ps, obj) {
      var start = ps;
      ps = ps.apply(this.p, obj);
      return ps ? ps.setValue(start.substring(ps)) : undefined;
    },

    function toString() {
      return 'str(' + this.SUPER() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Sequence0',

  documentation: `Parses the parser properties sequentially,
    without returning value`,

  properties: [
    {
      name: 'args',
      final: true,
      class: 'foam.parse.ParserArray'
    }
  ],

  methods: [
    function parse(ps, obj) {
      var args = this.args;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        if ( ! ( ps = ps.apply(p, obj) ) ) return undefined;
      }
      return ps;
    },

    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) {
        strs[i] = args[i].toString();
      }
      return 'seq0(' + strs.join(', ') + ')';
    }
  ]
});

foam.CLASS({
  package: 'foam.parse',
  name: 'Sequence1',

  documentation: `Parses the parser properties sequentially, returning
    the n(th) property value parsed.`,

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
      var n = this.n;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        if ( ! ( ps = ps.apply(p, obj) ) ) return undefined;
        if ( i === n ) ret = ps.value;
      }
      return ps.setValue(ret);
    },

    function toString() {
      var args = this.args;
      var strs = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) {
        strs[i] = args[i].toString();
      }
      return 'seq1(' + this.n + ', ' + strs.join(', ') + ')';
    }
  ]
});

foam.CLASS({
  package: 'foam.parse',
  name: 'Optional',
  extends: 'foam.parse.ParserDecorator',

  documentation: 'Refers to an optional parser property.',

  methods: [
    function parse(ps, obj) {
      return ps.apply(this.p, obj) || ps.setValue(null);
    },

    function toString() {
      return 'opt(' + this.SUPER() + ')';
    }
  ],
});


foam.CLASS({
  package: 'foam.parse',
  name: 'AnyChar',

  documentation: `Matches any char within the parse stream.
    Often used under the else clause of the 'not' parser
    property. Ex. \`not(',', anyChar())\``,

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function parse(ps) {
      return ps.head ? ps.tail : undefined;
    },

    function toString() { return 'anyChar()'; }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'NotChars',

  documentation: `Matches against all but the chars specified
    in the argument string.`,

  properties: [
    {
      name: 'string',
      final: true
    }
  ],

  methods: [
    function parse(ps) {
      return ps.head && this.string.indexOf(ps.head) === -1 ?
        ps.tail : undefined;
    },

    function toString() {
      var str = this.string;
      var chars = new Array(str.length);
      for ( var i = 0; i < str.length; i++ ) {
        chars[i] = str.charAt(i);
      }
      return 'notChars("' + chars.join('", "') + '")';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Chars',

  documentation: `Matches against any of the chars specified
    in the argument string.`,

  properties: [
    {
      name: 'string',
      final: true
    }
  ],

  methods: [
    function parse(ps) {
      return ps.valid && this.string.indexOf(ps.head) !== -1 ?
        ps.tail : undefined;
    },

    function toString() {
      var str = this.string;
      var chars = new Array(str.length);
      for ( var i = 0; i < str.length; i++ ) {
        chars[i] = str.charAt(i);
      }
      return 'chars("' + chars.join('", "') + '")';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Range',

  documentation: `Matches against a range of chars specified
    with from/to. Ex. \`range('0', '9')\` for digits`,

  properties: [
    {
      name: 'from',
      final: true
    },
    {
      name: 'to',
      final: true
    }
  ],

  methods: [
    function parse(ps) {
      if ( ! ps.head ) return undefined;
      return ( this.from <= ps.head && ps.head <= this.to ) ?
          ps.tail.setValue(ps.head) :
          undefined;
    },

    function toString() {
      return 'range("' + this.from + '", "' + this.to + '")';
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Repeat',
  extends: 'foam.parse.ParserDecorator',

  documentation: `Repeats matching to the parser property specified
    with an optional delimiter, and min number of matches.`,

  properties: [
    {
      class: 'foam.parse.ParserProperty',
      name: 'delimiter'
    },
    {
      class: 'Int',
      name: 'minimum'
    }
  ],

  methods: [
    function parse(ps, obj) {
      var ret = [];
      var p = this.p;
      var last;
      var delim = this.delimiter;

      while ( ps ) {
        // Checks for end of string
        if ( last && ( last.pos == ps.str[0].length ) ) {
          // Checks if previous char was delimiter, if not removes trailing empty string
          // TODO: Find a better way to handle reading past input
          if ( delim && ( ps.str[0][last.pos - 1] != delim.s ) ) ret.pop();
          return ps.setValue(ret);
        }

        last = ps;
        ps = ps.apply(p, obj);
        if ( ps ) ret.push(ps.value);
        if ( delim && ps ) {
          ps = ps.apply(delim, obj) || ps;
        }
      }

      if ( this.minimum > 0 && ret.length < this.minimum ) return undefined;

      return last.setValue(ret);
    },

    function toString() {
      var str = 'repeat(' + this.SUPER();
      if ( this.delimiter ) str += ', ' + this.delimiter;
      if ( this.minimum ) str += ', ' + this.minimum;
      str += ')';
      return str;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Plus',
  extends: 'foam.parse.Repeat',

  documentation: `Repeats matching to a parser property at least one time
    with an optional delimiter.`,

  properties: [
    ['minimum', 1]
  ],

  methods: [
    function toString() {
      var str = 'plus(' + this.p.toString();
      if ( this.delimiter ) str += ', ' + this.delimiter;
      str += ')';
      return str;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Repeat0',
  extends: 'foam.parse.Repeat',

  documentation: `Repeats matching to a parser property,
    without returning a value. Useful for whitespace.
    Ex. \`repeat0(sym('white'))\``,

  methods: [
    function parse(ps, obj) {
      var p = this.p;
      var last;
      var delim = this.delimiter;
      var i = 0;

      while ( ps ) {
        last = ps;
        ps = ps.apply(p, obj);
        if ( ps ) i++;
        if ( delim && ps ) {
          ps = ps.apply(delim, obj) || ps;
        }
      }

      if ( this.minimum > 0 && i < this.minimum ) return undefined;
      return last;
    },

    function toString() {
      var str = 'repeat0(' + this.p.toString();
      if ( this.delimiter ) str += ', ' + this.delimiter;
      if ( this.minimum ) str += ', ' + this.minimum;
      str += ')';
      return str;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Not',
  extends: 'foam.parse.ParserDecorator',

  documentation: `Ensures the leading char isn't the parser
    property specified. If not, attempts to parse with the
    else clause parser property. Useful for matching all but
    a particular character. Ex. \`not('"', anyChar())\``,

  properties: [
    {
      name: 'else',
      final: true,
      class: 'foam.parse.ParserProperty'
    }
  ],

  methods: [
    function parse(ps, obj) {
      return ps.apply(this.p, obj) ?
        undefined :
        (this.else ? ps.apply(this.else, obj) : ps);
    },

    function toString() {
      var str = 'not(' + this.SUPER();
      if ( this.else ) str += ', ' + this.else.toString();
      str += ')';
      return str;
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
    function parse(ps, obj) {
      ps = ps.apply(this.p, obj);
      return ps ?
        ps.setValue(this.action(ps.value)) :
        undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Symbol',

  documentation: `Parses based on the parser property named.`,

  properties: [
    {
      name: 'name',
      final: true
    },
  ],

  methods: [
    function parse(ps, grammar) {
      var p = grammar.getSymbol(this.name);
      if ( ! p ) {
        console.error('No symbol found for', this.name);
        return undefined;
      }
      return ps.apply(p, grammar);
    },

    function toString() { return 'sym("' + this.name + '")'; }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Parsers',

  requires: [
    'foam.parse.Alternate',
    'foam.parse.AnyChar',
    'foam.parse.Chars',
    'foam.parse.Literal',
    'foam.parse.LiteralIC',
    'foam.parse.Not',
    'foam.parse.NotChars',
    'foam.parse.Optional',
    'foam.parse.Plus',
    'foam.parse.Range',
    'foam.parse.Repeat',
    'foam.parse.Repeat0',
    'foam.parse.Sequence',
    'foam.parse.Sequence0',
    'foam.parse.Sequence1',
    'foam.parse.String',
    'foam.parse.Substring',
    'foam.parse.Symbol',
  ],

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function seq() {
      return this.Sequence.create({
        args: Array.from(arguments)
      });
    },

    function repeat0(p, delim, min) {
      return this.Repeat0.create({
        p: p,
        minimum: min || 0,
        delimiter: delim
      });
    },

    function simpleAlt() {
      return this.Alternate.create({
        args: Array.from(arguments)
      });
    },

    function alt() {
      return this.Alternate.create({
        args: Array.from(arguments)
      });
    },

    function sym(name) {
      return this.Symbol.create({ name: name });
    },

    function seq1(n) {
      return this.Sequence1.create({
        n: n,
        args: Array.from(arguments).slice(1)
      });
    },

    function seq0() {
      return this.Sequence0.create({
        args: Array.from(arguments)
      });
    },

    function repeat(p, delim, min) {
      return this.Repeat.create({
        p: p,
        minimum: min || 0,
        delimiter: delim
      });
    },

    function plus(p, delim) {
      return this.Plus.create({
        p: p,
        delimiter: delim
      });
    },

    function str(p) {
      return this.String.create({
        p: p
      });
    },

    function substring(p) {
      return this.Substring.create({
        p: p
      });
    },

    function range(a, b) {
      return this.Range.create({
        from: a,
        to: b
      });
    },

    function notChars(s) {
      return this.NotChars.create({
        string: s
      });
    },

    function chars(s) {
      return this.Chars.create({
        string: s
      });
    },

    function not(p, opt_else) {
      return this.Not.create({
        p: p,
        else: opt_else
      });
    },

    function optional(p) {
      return this.Optional.create({
        p: p
      });
    },

    function literal(s, value) {
      return this.Literal.create({
        s: s,
        value: value
      });
    },

    function literalIC(s, value) {
      return this.LiteralIC.create({
        s: s,
        value: value
      });
    },

    function anyChar() {
      return this.AnyChar.create();
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'PSymbol',

  properties: ['name', 'parser']
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Grammar',

  requires: [
    'foam.parse.StringPStream',
    'foam.parse.ParserWithAction',
    'foam.parse.Parsers'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.parse.PSymbol',
      name: 'symbols',
      adapt: function(_, o) {
        if ( Array.isArray(o) ) return o;

        if ( typeof o === 'function' ) {
          var args = o.toString().match(/\((.*?)\)/);
          if ( ! args ) {
            throw 'Could not parse arguments from parser factory function';
          }

          o = foam.Function.withArgs(o, this.Parsers.create(), this);
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
          if ( m[symbols[i].name] ) {
            console.error('Duplicate symbol found', symbols[i].name);
          }
          m[symbols[i].name] = symbols[i];
        }
        return m;
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
      var start = this.getSymbol(opt_name);
      foam.assert(start, 'No symbol found for', opt_name);

      var result = this.ps.apply(start, this);
      return result && result.value;
    },

    function getSymbol(name) {
      return this.symbolMap_[name].parser;
    },

    function addSymbol(name, parser) {
      this.symbols.push(foam.parse.PSymbol.create({
        name: name, parser: parser
      }));
    },

    function addActions(map) {
      for ( var key in map ) {
        this.addAction(key, map[key]);
      }
      return this;
    },

    function addAction(name, action) {
      for ( var i = 0 ; i < this.symbols.length ; i++ ) {
        if ( this.symbols[i].name === name ) {
          this.symbols[i].parser = this.ParserWithAction.create({
            p: this.symbols[i].parser,
            action: action
          });
        }
      }

      // TODO(adamvy): Array property should help me here
      this.pub('propertyChange', 'symbols', this.slot('symbols'));
      return this;
    }
  ]
});

foam.CLASS({
  package: 'foam.parse',
  name: 'GrammarAxiom',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'language',
      value: 'foam.parse.Parsers'
    },
    {
      name: 'symbols'
    },
    {
      class: 'Array',
      name: 'actions'
    },
    {
      class: 'Boolean',
      documentation: `When true, use foam.Function.withArgs() to evaluate
          symbols function in its original script closure context. Otherwise,
          use with(language) { eval(symbols()); }.`,
      name: 'withArgs'
    }
  ],
  methods: [
    function installInProto(proto) {
      var name = this.name;
      var axiom = this;
      Object.defineProperty(proto, name, {
        get: function() {
          var g = this.getPrivate_(name);

          if ( ! g ) {
            this.setPrivate_(name, g = axiom.buildGrammar(this));
          }

          return this.getPrivate_(name);
        }
      });
    },
    function buildGrammar(obj) {
      var g = obj.lookup('foam.parse.Grammar').create(null, obj);

      var symbols;

      if ( typeof this.symbols == 'function' ) {
        var language = obj.lookup(this.language).create();
        if (this.withArgs) {
          symbols = foam.Function.withArgs(this.symbols, language);
        } else {
          with(obj.lookup(this.language).create()) {
            symbols = eval('(' + this.symbols.toString() + ')()');
          }
        }
      } else {
        symbols = this.symbols;
      }

      for ( var key in symbols ) {
        g.addSymbol(key, symbols[key]);
      }

      for ( var i = 0 ; i < this.actions.length ; i++ ) {
        g.addAction(this.actions[i].name, (this.actions[i].code || this.actions[i]).bind(obj));
      }

      return g;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      name: 'grammars',
      of: 'foam.parse.GrammarAxiom'
    }
  ]
});

foam.CLASS({
  package: 'foam.parse',
  name: 'ImperativeGrammar',
  extends: 'foam.parse.Grammar',
});

/*
TODO(adamvy):
  -detect non string values passed to StringPStream.setString()
*/
