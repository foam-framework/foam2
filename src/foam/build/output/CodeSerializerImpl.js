/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build.output',
  name: 'CodeSerializerImpl',
  implements: [
    'foam.build.output.CodeSerializer',
  ],
  description: `
    The base serializer that's typically used to output models by the build tool
    in a format that looks similar to hand written models.
    There are many shortcuts we use when writing models that this serializer
    doesn't know/care about. Any optimizations should happen as decorators.
  `,
  requires: [
    'foam.core.Model',
    'foam.json2.Outputter',
    'foam.json2.PrettyOutputterOutput',
    'foam.json2.KeyQuoteStripOutputter',
    'foam.json2.DoubleToSingleQuoteReplaceOutputter',
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.json2.Outputter',
      name: 'out',
      factory: function() {
        return this.Outputter.create({
          out: this.KeyQuoteStripOutputter.create({
            delegate: this.DoubleToSingleQuoteReplaceOutputter.create({
              delegate: this.PrettyOutputterOutput.create()
            })
          })
        });
      }
    }
  ],
  methods: [
    function getOutputter() {
      return this.out;
    },
    function getString() {
      return this.getOutputter().out.output();
    },
    function output(x, v) {
      var out = this.getOutputter();
      var type = foam.typeOf(v);

      if ( type == foam.Number ) {
        out.n(v);
      } else if ( type == foam.String ) {
        out.s(v);
      } else if ( type == foam.Undefined ) {
        debugger;
      } else if ( type == foam.Null ) {
        out.nul();
      } else if ( type == foam.Boolean ) {
        out.b(v);
      } else if ( type == foam.Array ) {
        out.array();
        for ( var i = 0 ; i < v.length ; i++ ) {
          x.out.output(x, v[i])
        }
        out.end()
      } else if ( type == foam.Date ) {
        debugger;
      } else if ( type == foam.Object ) {
        // Check if it's an actual class. foam.core.FObject.isSubClass
        // should work but doesn't:
        // https://github.com/foam-framework/foam2/issues/1023
        if ( v && v.prototype &&
             ( foam.core.FObject.prototype === v.prototype ||
               foam.core.FObject.prototype.isPrototypeOf(v.prototype) ) ) {
          if ( v.id.indexOf('AnonymousClass') == 0 ) {
            x.out.output(x, v.model_);
          } else {
            out.s(v.id);
          }
        } else {
          out.obj();
          var keys = Object.keys(v);
          for ( var i = 0 ; i < keys.length ; i++ ) {
            if ( foam.Undefined.isInstance(v[keys[i]]) ) continue;
            out.key(keys[i]);
            x.out.output(x, v[keys[i]]);
          }
          out.end();
        }
      } else if ( type == foam.core.FObject ) {
        out.obj();
        var cls = v.cls_;
        var axioms = v.cls_.getAxiomsByClass(foam.core.Property);

        out.key("class");
        x.out.output(x, cls);

        for ( var i = 0 ; i < axioms.length ; i++ ) {
          var a = axioms[i];
          if ( v.hasDefaultValue(a.name) ) continue;

          if ( a.transient ) continue;

          out.key(a.name);

          x.out.output(x, a.f(v));
        }

        out.end();
      } else if ( type == foam.Function ) {
        out.n(v.toString());
      }
    }
  ]
});
