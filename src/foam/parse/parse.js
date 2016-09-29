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
    /*
      TODO: make this model abstract
      TODO: allow methods without code in abstract classes
    {
      name: 'step'
    },
    */
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
      //      this.restore.ps = this.ps;
      this.restore.next.ps = this.ps;
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
        if ( str.charAt(i) !== ps.head.toLowerCase() ) {
          this.fail.ps = this.ps;
          return this.fail;
        }
      }
      this.success.ps = ps.setValue(this.value || str);
      return this.success;
    }
  ]
});


/**
 * Case-insensitive literal that returns a fixed value when it matches.
 */
foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'LiteralICWithValue',
  extends: 'foam.parse.compiled.State',

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
    function step() {
      var str = this.lower;
      var ps = this.ps;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head.toLowerCase() ) {
          this.fail.ps = this.ps;
          return this.fail;
        }
      }
      this.success.ps = ps.setValue(this.value || this.s);
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
  name: 'LiteralIC',
  extends: 'foam.parse.compiled.State',

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
    }
  ],

  methods: [
    function step() {
      var ps1 = this.ps;
      var ps = this.ps;
      var str = this.lower;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( ! ps.head || str.charAt(i) !== ps.head.toLowerCase() ) {
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
  name: 'Range',
  extends: 'foam.parse.compiled.State',

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
    function step() {
      var ps = this.ps;
      if ( this.from <= ps.head && ps.head <= this.to ) {
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
  name: 'Counter',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'count',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      this.count[0]++;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'CounterStart',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      name: 'count',
      final: true
    },
    {
      name: 'next',
      final: true
    }
  ],

  methods: [
    function step() {
      this.count[0] = 0;
      this.next.ps = this.ps;
      return this.next;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse.compiled',
  name: 'MinimumCount',
  extends: 'foam.parse.compiled.State',

  properties: [
    {
      class: 'Int',
      name: 'minimum',
      final: true
    },
    {
      name: 'count',
      final: true
    }
  ],

  methods: [
    function step() {
      if ( this.count[0] < this.minimum ) {
        this.fail.ps = this.ps;
        return this.fail;
      }
      this.success.ps = this.ps;
      return this.success;
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
      return this.fail;
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
    function step() {
      //      pps[0] = pps[0].setValue(this.value);
      this.next.ps = this.ps.setValue(this.value);
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
    function compile(success, fail, withValue) {
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
      });
    },

    function parse(ps) {
      var str = this.s;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( str.charAt(i) !== ps.head ) {
          return undefined;
        }
      }
      return ps.setValue(this.value !== undefined ? this.value : str);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'LiteralIC',

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
    function compile(success, fail, withValue) {
      return withValue ?
        foam.parse.compiled.LiteralICWithValue.create({
          s: this.s,
          value: this.value !== undefined ? this.value : this.s,
          success: success,
          fail: fail
        }) :
      foam.parse.compiled.LiteralICWithValue.create({
        s: this.s,
        success: success,
        fail: fail
      });
    },
    function parse(ps) {
      var str = this.lower;
      for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
        if ( ! ps.head || str.charAt(i) !== ps.head.toLowerCase() ) {
          return undefined;
        }
      }
      return ps.setValue(this.value !== undefined ? this.value : this.s);
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
      var fails = [];
      var args = this.args;

      for ( var i = 0 ; i < args.length ; i++ ) {
        fails[i] = foam.parse.compiled.Placeholder.create();
        alt[i] = args[i].compile(success, fails[i], withValue, grammar);
      }

      for ( i = 0 ; i < alt.length ; i++ ) {
        fails[i].next = alt[i + 1] || fail;
      }

      return alt[0];
    },

    function parse(ps, obj) {
      // TODO(adamvy): Should we remove the obj argument in favour of
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
        restore: restore
      });

      var value = [];

      var args = this.args;
      var successes = [];
      var seq = [];
      for ( var i = 0 ; i < args.length ; i++ ) {
        successes[i] = foam.parse.compiled.Placeholder.create();
        seq[i] = args[i].compile(
          withValue ?
            foam.parse.compiled.AddValue.create({
              value: value,
              next: successes[i]
            }) :
            successes[i],
          restore,
          withValue,
          grammar);
      }

      success = withValue ?
        foam.parse.compiled.FinishValue.create({value: value, next: success}) :
        success;

      for ( i = 0 ; i < seq.length ; i++ ) {
        successes[i].next = seq[i + 1] || success;
      }

      capture.next = seq[0];

      return withValue ?
        foam.parse.compiled.StartValue.create({value: value, next: capture}) :
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
  name: 'String',
  extends: 'foam.parse.ParserDecorator',
  methods: [
    function parse(ps, obj) {
      ps = this.p.parse(ps, obj);
      return ps ? ps.setValue(ps.value.join('')) : undefined;
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
        restore: restore
      });

      var value = [];

      var args = this.args;
      var successes = [];
      var seq = [];
      for ( var i = 0 ; i < args.length ; i++ ) {
        successes[i] = foam.parse.compiled.Placeholder.create();
        seq[i] = args[i].compile((withValue && i === this.n) ?
            foam.parse.compiled.GetValue.create({
              value: value,
              next: successes[i]
            }) : successes[i],
            restore,
            withValue,
            grammar);
      }

      success = withValue ?
        foam.parse.compiled.SetValue.create({value: value, next: success}) :
        success;

      for ( i = 0 ; i < seq.length ; i++ ) {
        successes[i].next = seq[i + 1] || success;
      }

      capture.next = seq[0];

      return capture;
    },

    function parse(ps, obj) {
      var ret;
      var args = this.args;
      var n = this.n;
      for ( var i = 0, p ; p = args[i] ; i++ ) {
        if ( ! ( ps = p.parse(ps, obj) ) ) return undefined;
        if ( i === n ) ret = ps.value;
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

  axioms: [foam.pattern.Singleton.create()],

  methods: [
    function compile(success, fail) {
      return foam.parse.compiled.AnyChar.create({
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
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
    function compile(success, fail) {
      return foam.parse.compiled.ParserState.create({
        parser: this,
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
      return ps.head && this.string.indexOf(ps.head) === -1 ?
        ps.tail : undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Range',

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
    function compile(success, fail) {
      return foam.parse.compiled.Range.create({
        from: this.from,
        to: this.to,
        success: success,
        fail: fail
      });
    },

    function parse(ps) {
      if ( ! ps.head ) return undefined;
      return ( this.from <= ps.head && ps.head <= this.to ) ?
          ps.tail.setValue(ps.head) : undefined;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Repeat',
  extends: 'foam.parse.ParserDecorator',

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
    function compile(success, fail, withValue, grammar) {
      var pSuccess = foam.parse.compiled.Placeholder.create();
      var pFail = foam.parse.compiled.Placeholder.create();
      var p = this.p.compile(pSuccess, pFail, withValue, grammar);

      var delimSuccess = foam.parse.compiled.Placeholder.create();
      var delimFail = foam.parse.compiled.Placeholder.create();

      var delim;
      if ( this.delimiter ) {
        delim = this.delimiter.compile(delimSuccess, delimFail, false, grammar);
      } else {
        delim = foam.parse.compiled.Placeholder.create({
          next: delimSuccess
        });
      }

      var start = p;

      if ( this.minimum > 0 ) {
        var count = [];

        start = foam.parse.compiled.CounterStart.create({
          count: count,
          next: start
        });

        pSuccess.next = foam.parse.compiled.Counter.create({
          count: count
        });
        pSuccess = pSuccess.next;

        success = foam.parse.compiled.MinimumCount.create({
          count: count,
          minimum: this.minimum,
          success: success,
          fail: fail
        });
      }

      if ( withValue ) {
        var value = [];

        pSuccess.next = foam.parse.compiled.AddValue.create({
          value: value
        });
        pSuccess = pSuccess.next;

        start = foam.parse.compiled.StartValue.create({
          value: value,
          next: start
        });

        success = foam.parse.compiled.FinishValue.create({
          value: value,
          next: success
        });
      }

      pSuccess.next = delim;
      delimSuccess.next = p;
      delimFail.next = success;

      pFail.next = success;

      return start;
    },

    function parse(ps, obj) {
      var ret = [];
      var p = this.p;
      var last;
      while ( ps ) {
        last = ps;
        ps = p.parse(ps, obj);
        if ( ps ) ret.push(ps.value);
        if ( this.delimiter && ps ) {
          ps = this.delimiter.parse(ps, obj) || ps;
        }
      }

      if ( this.minimum > 0 && ret.length < this.minimum ) return undefined;
      return last.setValue(ret);
    }
  ]
});

foam.CLASS({
  package: 'foam.parse',
  name: 'Plus',
  extends: 'foam.parse.Repeat',
  properties: [
    ['minimum', 1]
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
        success: success
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
  name: 'Symbol',

  properties: [
    {
      name: 'name',
      final: true
    },
    {
      class: 'Boolean',
      name: 'compiling',
      value: false
    },
    {
      name: 'compiled'
    }
  ],

  methods: [
    function compile(success, fail, withValue, grammar) {
      if ( this.compiling ) {
        var ret = foam.parse.compiled.Placeholder.create({
          name: 'symbol placeholder'
        });

        this.compiled(function(p) {
          ret.next = p;
        });

        return ret;
      }

      this.compiling = true;
      var future = (function() {
        var waiters = [];
        var value;
        var set = false;

        return {
          get: function(f) {
            if ( set ) {
              f(value);
              return;
            }

            waiters.push(f);
          },
          set: function(v) {
            set = true;
            value = v;

            for ( var i = 0 ; i < waiters.length ; i++ ) {
              waiters[i](value);
            }

            waiters = null;
          }
        };
      })();

      this.compiled = future.get;

      var compiled = grammar.getSymbol(this.name).compile(
          success, fail, withValue, grammar);

      future.set(compiled);

      this.compiling = false;
      this.compiled = null;

      return compiled;
    },

    function parse(ps, grammar) {
      var p = grammar.getSymbol(this.name);
      if ( ! p ) {
        console.error('No symbol found for', this.name);
        return undefined;
      }
      return p.parse(ps, grammar);
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Parsers',

  axioms: [foam.pattern.Singleton.create()],

  methods: [
    function seq() {
      return foam.lookup('foam.parse.Sequence').create({
        args: Array.from(arguments)
      });
    },

    function repeat0(p, delim, min) {
      return foam.lookup('foam.parse.Repeat0').create({
        p: p,
        minimum: min,
        delimiter: delim
      });
    },

    function simpleAlt() {
      return foam.lookup('foam.parse.Alternate').create({
        args: Array.from(arguments)
      });
    },

    function alt() {
      return foam.lookup('foam.parse.Alternate').create({
        args: Array.from(arguments)
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
        args: Array.from(arguments).slice(1)
      });
    },

    function repeat(p, delim, min) {
      return foam.lookup('foam.parse.Repeat').create({
        p: p,
        minimum: min,
        delimiter: delim
      });
    },

    function plus(p, delim) {
      return foam.lookup('foam.parse.Plus').create({
        p: p,
        delimiter: delim
      });
    },

    function str(p) {
      return foam.lookup('foam.parse.String').create({
        p: p
      });
    },

    function range(a, b) {
      return foam.lookup('foam.parse.Range').create({
        from: a,
        to: b
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
        p: p
      });
    },

    function literal(s, value) {
      return foam.lookup('foam.parse.Literal').create({
        s: s,
        value: value
      });
    },

    function literalIC(s, value) {
      return foam.lookup('foam.parse.LiteralIC').create({
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
  name: 'PSymbol',

  properties: ['name', 'parser']
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Grammar',

  requires: [
    'foam.parse.StringPS',
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
      name: 'finishSuccess',
      factory: function() {
        return {};
      }
    },
    {
      name: 'finishFail',
      factory: function() {
        return {};
      }
    },
    {
      name: 'compiled',
      expression: function(symbolMap_) {
        return symbolMap_.START.parser.compile(
          this.finishSuccess,
          this.finishFail,
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
      var success = this.finishSuccess;
      var fail = this.finishFail;
      return this.parse(this.ps, state, success, fail);
    },

    function parse(ps, state, success, fail) {
      while ( state !== success && state !== fail ) {
        state = state.step();
      }
      if ( state === success ) return state.ps.value;
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
        if ( this.symbols[i].name === name ) {
          this.symbols[i].parser = foam.parse.ParserWithAction.create({
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
  name: 'ImperativeGrammar',
  extends: 'foam.parse.Grammar',

  methods: [
    function parseString(str, opt_name) {
      opt_name = opt_name || 'START';

      this.ps.setString(str);
      var start = this.getSymbol(opt_name);
      console.assert(start, 'No symbol found for', opt_name);

      var result = start.parse(this.ps, this);
      return result && result.value;
    }
  ]
});

/*
TODO(adamvy):
  -detect non string values passed to StringPS.setString()
*/
