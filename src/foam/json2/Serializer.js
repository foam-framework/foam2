/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.json2',
  name: 'Serializer',
  requires: [
    'foam.json2.Outputter',
  ],
  methods: [
    function stringify(x, v) {
      var serializer = this.InnerSerializer.create();
      serializer.output(x, v);
      return serializer.getString();
    }
  ],
  classes: [
    {
      name: 'InnerSerializer',
      requires: [
        'foam.json2.Outputter'
      ],
      properties: [
        {
          class: 'Map',
          name: 'deps'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.json2.Outputter',
          name: 'out',
          factory: function() {
            return this.Outputter.create();
          }
        }
      ],
      methods: [
        function getString() {
          var deps = Object.keys(this.deps).map(function(d) { return `"${d}"` }).join(',');
          return `{"$DEPS$":[${deps}],"$BODY$":${this.out.getString()}}`
        },
        function output(x, v) {
          var out = this.out;
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
              this.output(x, v[i])
            }
            out.end()
          } else if ( type == foam.Date ) {
            out.obj();
            out.key("$DATE$");
            out.n(v.getTime());
            out.end();
          } else if ( type == foam.RegExp ) {
            out.obj();
            out.key("$REGEXP$");
            out.s(v.toString());
            out.end();
          } else if ( type == foam.Object ) {
            if ( foam.core.FObject.isSubClass(v) ) { // Is an actual class
              if ( v.id.indexOf('AnonymousClass') == 0 ) {
                this.output(x, v.model_);
              } else {
                out.obj();
                out.key("$CLS$");
                out.s(v.id);
                out.end();
                this.deps[v.id] = true;
              }
            } else { // is some other JS object
              if ( v.outputJSON2 ) {
                // If it knows how to output itself, let it do so
                v.outputJSON2(x, this, out);
              } else {
                // Otherwise just do our best.  This is pretty equivalent to
                // JSON.stringify()
                out.obj();
                var keys = Object.keys(v);
                for ( var i = 0 ; i < keys.length ; i++ ) {
                  if ( foam.Undefined.isInstance(v[keys[i]]) ) continue;

                  out.key(keys[i]);
                  this.output(x, v[keys[i]]);
                }
                out.end();
              }
            }
          } else if ( type == foam.core.FObject ) {
            if ( v.outputJSON2 ) v.outputJSON2(x, this, out);
            else {
              out.obj();
              var cls = v.cls_;
              var axioms = v.cls_.getAxioms();

              out.key("$INST$");
              this.output(x, cls);

              for ( var i = 0 ; i < axioms.length ; i++ ) {
                var a = axioms[i];
                if ( a.outputPropertyJSON2 ) a.outputPropertyJSON2(x, v, this, out);
              }

              out.end();
            }
          } else if ( type == foam.Function ) {
            if ( v.toString().startsWith("foam.mmethod(") ) {
              var map = v.map;
              var defaultMethod = v.defaultMethod;
              out.obj();
              
              out.key("$MMETHOD$");
              out.b(true);

              out.key("map");
              out.obj();
              
              for ( var key in map ) {
                out.key(key);
                this.output(map[key]);
              }

              out.end();

              if ( defaultMethod ) {
                out.key("default");

                this.output(defaultMethod);
              }

              out.end();
            } else {
              var breakdown = foam.Function.breakdown(v);
              if ( breakdown == null ) {
                debugger;
                breakdown = foam.Function.breakdown(v);
              }

              foam.assert(breakdown, "Failed to parse funciton, this is a bug!", "Function was ", v);

              foam.assert(foam.String.isInstance(breakdown.body), "Breakdown contains no body text.");

              out.obj();

              out.key("$FUNC$");
              out.b(true);

              out.key("name")
              out.s(breakdown.name);

              out.key("async");
              out.b(breakdown.async);

              out.key("args");
              out.array();
              for ( var i = 0 ; i < breakdown.args.length ; i++ ) {
                out.s(breakdown.args[i]);
              }
              out.end();

              out.key("body");
              out.s(breakdown.body);

              out.end();
            }
          }
        }
      ]
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Property',
  methods: [
    function outputPropertyJSON2(x, obj, outputter, out) {
      if ( obj.hasDefaultValue(this.name) ) return;

      if ( this.transient ) return;

      out.key(this.name);

      outputter.output(x, this.f(obj), out);
    }
  ]
});
