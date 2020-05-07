/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'ErrorReportingPStream',
  properties: [
    {
      class: 'Simple',
      name: 'delegate'
    },
    {
      name: 'intro'
    },
    {
      name: 'pos',
      value: 0
    },
    {
      name: 'limit',
      value: 100
    },
    {
      name: 'head',
      getter: function() { return this.delegate.head; }
    },
    {
      name: 'tail',
      getter: function() {
        if ( ! this.instance_.tail ) {
          var ps = this.cls_.create();
          ps.delegate = this.delegate.tail;
          ps.report = this.report;
          ps.pos = this.pos + 1;
          ps.limit = this.limit;
          ps.intro = ps.pos > ps.limit ?
            this.intro.tail : this.intro;
          this.instance_.tail = ps;
        }
        return this.instance_.tail;
      },
      setter: function(tail) { this.instance_.tail = tail; }
    },
    {
      name: 'valid',
      getter: function() { return this.delegate.valid; }
    },
    {
      name: 'value',
      setter: function(value) { this.delegate.value = value; },
      getter: function() { return this.delegate.value; }
    },
    {
      class: 'Simple',
      name: 'report'
    }
  ],

  methods: [
    function init() {
      this.intro = this;
    },

    function setValue(value) {
      if ( value === undefined ) value = null;
      var ps = this.cls_.create();
      ps.pos      = this.pos;
      ps.limit    = this.limit;
      ps.intro    = this.intro;
      ps.report   = this.report;
      ps.delegate = this.delegate.setValue(value);
      ps.tail     = this.tail;
      return ps;
    },

    function substring(end) {
      return this.delegate.substring(end.delegate);
    },

    function compareTo(o) {
      return this.delegate.compareTo(o.delegate);
    },

    function getIntroString() {
      return this.intro.substring(this);
    },

    function apply(p, obj) {
      var res = p.parse(this, obj);
      if ( ! res ) this.report(this, p, obj);
      return res;
    }
  ]
});
