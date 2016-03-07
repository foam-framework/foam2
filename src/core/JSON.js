

/**
// JSON Support
//
// TODO:
//   - don't output default values (optionally)
//   - don't output default classes
//   - quote keys when required
//   - escape values
//   - don't output transient properties
//   - pretty printing
//   - property filtering
//   - allow for custom Property JSON support
//   - compact output
//   -
*/

foam.CLASS({
  refines: 'foam.core.FObject',
  methods: [
    function toJSON() {
      return foam.json.stringify(this);
    },
    function outputJSON(out, opt_options) {
      out('{class:"', this.cls_.id, '"');
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        out(',', p.name, ':');
        foam.json.output(out, this[p.name]);
      }
      out('}');
    }
  ]
});

foam.LIB({
  name: 'Array',
  methods: [
    function toJSON() {
      return foam.json.stringify(this);
    },
    function outputJSON(out, opt_options) {
      out('[');
      for ( var i = 0 ; i < this.length ; i++ ) {
        foam.json.output(out, this[i]);
        if ( i < this.length -1 ) out(',');
      }
      out(']');
    }
  ]
});


foam.LIB({
  name: 'json',
  methods: [
    function createOut() {
      var buf = '';
      function out() {
        for ( var i = 0 ; i < arguments.length ; i++ )
          buf += arguments[i];
      }
      out.toString = function() { return buf; };
      return out;
    },
    function output(out, o) {
      if ( typeof o === 'undefined' ) {
        out('undefined');
      } else if ( typeof o === 'string' ) {
        out('"', o, '"');
      } else if ( typeof o === 'number' ) {
        out(o);
      } else if ( o.outputJSON ) {
        o.outputJSON(out);
      }
    },
    function parse(json, opt_class) {
      if ( json.class ) {
        var cls = foam.lookup(json.class);
        foam.X.assert(cls, 'Unknown class "', json.class, '" in foam.json.parse.');
        return cls.create(json);
      }
      if ( opt_class )
        return opt_class.create(json);

      return json;
    },
    function parseArray(a, opt_class) {
      return a.map(function(e) { return foam.json.parse(e, opt_class); });
    },
    function parseString(str) {
      return eval('(' + str + ')');
    },
    function stringify(o, opt_options) {
      var out = this.createOut();
      o.outputJSON(out, opt_options);
      return out.toString();
    }
  ]
});

