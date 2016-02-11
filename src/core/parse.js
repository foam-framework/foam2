foam.CLASS({
  name: 'StringPS',
  properties: [
    {
      name: 'str',
      factory: function() { return ['']; }
    },
    {
      name: 'pos',
      type: 'Int',
      defaultValue: 0
    },
    {
      name: 'tail',
      factory: function() {
        return StringPS.create({
          str: this.str,
          pos: this.pos + 1
        });
      }
    },
    {
      name: 'head',
      getter: function() {
        return this.str[0][this.pos];
      }
    },
    {
      name: 'value'
    }
  ],
  methods: [
    function setValue(value) {
      return StringPS.create({
        str: this.str,
        pos: this.pos,
        tail: this.tail,
        value: value
      });
    },
    function setString(s) {
      this.str[0] = s;
    }
  ]
});

foam.CLASS({
  name: 'Parser',
  properties: [
    {
      name: 'action',
    }
  ],
  methods: [
    function parse(ps, grammar) {
      var ret = this.parse_(ps, grammar);
      if ( ret && this.action ) ret = ret.setValue(this.action(ret.value));
      return ret;
    },
    function parse_(ps, grammar) {
      // Template method implemented by children
    }
  ],
});

foam.CLASS({
  name: 'ParserArrayProperty',
  extends: 'ArrayProperty',
  properties: [
    {
      name: 'adaptArrayElement',
      defaultValue: function(a) {
        return typeof(a) === 'string' ?
          Literal.create({ s: a }) :
          a;
      }
    }
  ]
})

foam.CLASS({
  name: 'Literal',
  extends: 'Parser',
  properties: [
    {
      name: 's'
    },
    {
      name: 'value'
    }
  ],
  methods: [
    function parse_(ps, grammar) {
      for ( var i = 0 ; i < this.s.length ; i++, ps = ps.tail ) {
        if ( ps.head !== this.s[i] ) return undefined;
      }
      return ps.setValue(this.value || this.s);
    }
  ]
});

foam.CLASS({
  name: 'Alternate',
  extends: 'Parser',
  properties: [
    {
      name: 'args',
      type: 'ParserArray'
    }
  ],
  methods: [
    function parse_(ps, grammar) {
      // TODO: Should we remove the grammar argument in favour of
      // passing the grammar along via context?
      for ( var i = 0, p ; p = this.args[i] ; i++ ) {
        var ret = p.parse(ps, grammar);
        if ( ret ) return ret;
      }
      return undefined;
    }
  ]
});


foam.CLASS({
  name: 'Sequence',
  extends: 'Parser',
  properties: [
    {
      name: 'args',
      type: 'ParserArray'
    }
  ],
  methods: [
    function parse_(ps, grammar) {
      var ret = [];
      for ( var i = 0, p ; p = this.args[i] ; i++ ) {
        if ( ! ( ps = p.parse(ps, grammar) ) ) return undefined;
        ret.push(ps.value);
      }
      return ps.setValue(ret);
    }
  ]
});


foam.CLASS({
  name: 'PSymbol',
  extends: 'Parser',
  properties: [
    'name'
  ],
  methods: [
    function parse_(ps, grammar) {
      if ( ! grammar.symbols[this.name] ) {
        console.error("No symbol found for", this.name);
        return undefined;
      }
      var ret = grammar.symbols[this.name].parse(ps, grammar);
      if ( ret && this.action ) ret = ret.setValue(this.action(ret.value));
      return ret;
    }
  ]
});

foam.CLASS({
  name: 'Grammar',
  properties: [
    {
      name: 'name'
    },
    {
      name: 'start',
      defaultValue: 'START'
    },
    {
      name: 'symbols'
    },
    {
      name: 'actions'
    },
    {
      name: 'ps',
      factory: function() {
        return StringPS.create();
      }
    }
  ],
  methods: [
    function parseString(string) {
      for ( var key in this.symbols ) {
        this.symbols[key].action = this.actions[key];
      }

      // TODO: Error handling for no starting symbol being defined
      var start = this.symbols[this.start];
      this.ps.setString(string);
      var res = start.parse(this.ps, this);
      return res ? res.value : undefined;
    },
    function installInProto(proto) {
      proto[this.name] = this.parseString.bind(this);
      proto[foam.string.constantize(this.name)] = this;
    },
    function installInClass(cls) {
      cls[foam.string.constantize(this.name)] = this;
    }
  ]
});

foam.CLASS({
  name: 'Model',
  properties: [
    {
      name: 'grammars',
      type: 'AxiomArray',
      subType: 'Grammar',
      adaptArrayElement: function(o) {
        return Grammar.create(o);
      }
    }
  ]
});

foam.LIB({
  name: 'parse',
  methods: [
    function alt() {
      return Alternate.create({ args: foam.array.argsToArray(arguments) });
    },
    function seq() {
      return Sequence.create({ args: foam.array.argsToArray(arguments) });
    },
    function sym(name) {
      return PSymbol.create({ name: name });
    },
  ]
});
