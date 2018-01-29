/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.json2',
  name: 'Serializer',
  requires: [
    'foam.json2.Outputter'
  ],
  methods: [
    function stringify(x, v) {
      var out = this.Outputter.create();
      this.output(x, v, out);
      return out.str;
    },

    function output(x, v, out) {
      var type = foam.typeOf(v);

      if ( type == foam.Number ) {
        out.n(v);
      } else if ( type == foam.String ) {
        out.s(v);
      } else if ( type == foam.Undefined ) {
        out.obj();
        out.key("$UNDEF");
        out.b(true);
        out.end();
      } else if ( type == foam.Null ) {
        out.nul();
      } else if ( type == foam.Boolean ) {
        out.b(v);
      } else if ( type == foam.Array ) {
        out.array();
        for ( var i = 0 ; i < v.length ; i++ ) {
          this.output(x, v[i], out)
        }
        out.end()
      } else if ( type == foam.Date ) {
        out.obj();
        out.key("$DATE$");
        out.n(v.getTime());
        out.end();
      } else if ( type == foam.Object ) {
        if ( foam.core.FObject.isSubClass(v) ) { // Is an actual class
          if ( v.id.indexOf('AnonymousClass') == 0 ) {
            this.output(x, v.model_, out);
          } else {
            out.obj();
            out.key("$CLS$");
            out.s(v.id);
            out.end();
          }
        } else {
          out.obj();
          var keys = Object.keys(v);
          for ( var i = 0 ; i < keys.length ; i++ ) {
            if ( foam.Undefined.isInstance(v[keys[i]]) ) continue;

            out.key(keys[i]);
            this.output(x, v[i], out);
          }
          out.end();
        }
      } else if ( type == foam.core.FObject ) {
        if ( v.outputJSON2 ) v.outputJSON2(x, this, out);
        else {
          out.obj();
          var cls = v.cls_;
          var axioms = v.cls_.getAxioms();

          out.key("$INST$");
          this.output(x, cls, out);

          for ( var i = 0 ; i < axioms.length ; i++ ) {
            var a = axioms[i];
            if ( a.outputPropertyJSON2 ) a.outputPropertyJSON2(x, v, this, out);
          }

          out.end();
        }
      } else if ( type == foam.Function ) {
        out.obj();
        out.key("$FUNC$");
        out.s(v.toString());
        out.end();
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Property',
  methods: [
    function outputPropertyJSON2(x, obj, outputter, out) {
      if ( obj.hasDefaultValue(this.name) ) return;

      out.key(this.name);

      outputter.output(x, this.f(obj), out);
    }
  ]
});
