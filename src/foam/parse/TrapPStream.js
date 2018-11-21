foam.CLASS({
  package: 'foam.parse',
  name: 'TrapPStream',

  properties: [
    {
      name: 'delegate'
    },
    {
      name: 'head',
      getter: function() { return this.delegate.head; },
    },
    {
      name: 'tail',
      getter: function() {
        throw "trap";
        return foam.parse.InvalidPStream.create();
      },
      setter: function(){}
    },
    {
      name: 'valid',
      getter: function() { return this.delegate.valid; }
    },
    {
      name: 'value',
      getter: function() { return this.delegate.value; }
    }
  ],

  methods: [
    function initArgs() {},

    function setValue(value) {
      if ( value === undefined ) value = null;
      var ps = this.cls_.create();
      ps.delegate = this.delegate.setValue(value);
      ps.report = this.report;
      return ps;
    },

    function substring(end) {
      return null;
    },

    function apply(p, obj) {
      return p.parse(this, obj);
    },

    function compareTo(other) {
      return this.delegate.compareTo(other.delegate);
    }
  ]
});
