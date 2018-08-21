/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'JsCodeOutputter',
  requires: [
    'foam.core.Script',
    'foam.build.Lib',
    'foam.dao.Relationship',

    // TODO: These shouldn't need to be listed here.
    'foam.json2.Outputter',
    'foam.json2.PrettyOutputterOutput',
  ],
  methods: [
    function stringify(x, v) {
      var f = this.Relationship.isInstance(v) ? 'RELATIONSHIP' :
        this.Script.isInstance(v) ? 'SCRIPT' :
        this.Lib.isInstance(v) ? 'LIB' :
        'CLASS';

      var serializer = this.InnerSerializer.create();
      serializer.output(x, this.Lib.isInstance(v) ? v.json : v);
      return `foam.${f}(${serializer.getString()});`;
    }
  ],
  classes: [
    {
      name: 'InnerSerializer',
      requires: [
        'foam.core.Model',
        'foam.json2.Outputter',
        'foam.json2.PrettyOutputterOutput',
      ],
      properties: [
        {
          class: 'FObjectProperty',
          of: 'foam.json2.Outputter',
          name: 'out',
          factory: function() {
            return this.Outputter.create({
              out: this.PrettyOutputterOutput.create()
            });
          }
        }
      ],
      methods: [
        function getString() {
          return this.out.out.output();
        },
        function output(x, v) {
          // When encountering a refinement without a name set, manually set it
          // to ensure the ID is consistent before/after writing out the JS code
          // because it can change depending on the order of axioms that are
          // printed out.
          if ( this.Model.isInstance(v) && v.hasOwnProperty('refines') && ! v.hasOwnProperty('name') ) {
            v = v.clone();
            var id = v.id.split('.');
            v.name = id.pop();
            v.package = id.join('.');
          }

          var out = this.out;
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
              this.output(x, v[i])
            }
            out.end()
          } else if ( type == foam.Date ) {
            debugger;
          } else if ( type == foam.Object ) {
            if ( v['getAxioms'] ) { // Is an actual class
              if ( v.id.indexOf('AnonymousClass') == 0 ) {
                this.output(x, v.model_);
              } else {
                out.s(v.id);
              }
            } else {
              out.obj();
              var keys = Object.keys(v);
              for ( var i = 0 ; i < keys.length ; i++ ) {
                if ( foam.Undefined.isInstance(v[keys[i]]) ) continue;
                out.key(keys[i]);
                this.output(x, v[keys[i]]);
              }
              out.end();
            }
          } else if ( type == foam.core.FObject ) {
            out.obj();
            var cls = v.cls_;
            var axioms = v.cls_.getAxiomsByClass(foam.core.Property);

            out.key("class");
            this.output(x, cls);

            for ( var i = 0 ; i < axioms.length ; i++ ) {
              var a = axioms[i];
              if ( v.hasDefaultValue(a.name) ) continue;

              if ( a.transient ) continue;

              out.key(a.name);

              this.output(x, a.f(v));
            }

            out.end();
          } else if ( type == foam.Function ) {
            out.n(v.toString());
          }
        }
      ]
    }
  ]
});
