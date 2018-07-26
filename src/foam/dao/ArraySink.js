/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ArraySink',
  extends: 'foam.dao.AbstractSink',

  constants: {
    // Dual to outputJSON method.
    //
    // TODO(markdittmer): Turn into static method: "parseJSON" once
    // https://github.com/foam-framework/foam2/issues/613 is fixed.
    PARSE_JSON: function(json, opt_cls, opt_ctx) {
      var cls = json.of || opt_cls;
      var array = json.array;
      if ( ! array ) return foam.dao.ArraySink.create({ of: cls }, opt_ctx);
      if ( foam.typeOf(cls) === foam.String )
        cls = ( opt_ctx || foam ).lookup(cls);

      return foam.dao.ArraySink.create({
        of: cls,
        array: foam.json.parse(array, cls, opt_ctx)
      }, opt_ctx);
    }
  },

  properties: [
    {
      class: 'List',
      name: 'array',
      adapt: function(old, nu) {
        if ( ! this.of ) return nu;
        var cls = this.of;
        for ( var i = 0; i < nu.length; i++ ) {
          if ( ! cls.isInstance(nu[i]) )
            nu[i] = cls.create(nu[i], this.__subContext__);
        }
        return nu;
      },
      factory: function() { return []; },
      javaFactory: `return new java.util.ArrayList();`
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'a',
      transient: true,
      getter: function() {
        this.warn('Use of deprecated ArraySink.a');
        return this.array;
      }
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(o, sub) {
        var cls = this.of;
        if ( ! cls ) {
          this.array.push(o);
          return;
        }
        if ( cls.isInstance(o) )
          this.array.push(o);
        else
          this.array.push(cls.create(o, this.__subContext__));
      },
      swiftCode: 'array.append(obj)',
      javaCode: 'if ( getArray() == null ) setArray(new java.util.ArrayList());\n'
                +`getArray().add(obj);`
    },
    function outputJSON(outputter) {
      outputter.start('{');
      var outputClassName = outputter.outputClassNames;
      if ( outputClassName ) {
        outputter.nl().indent().out(
            outputter.maybeEscapeKey('class'), ':', outputter.postColonStr, '"',
            this.cls_.id, '"');
      }

      var array = this.array;
      var outputComma = outputClassName;
      if ( this.of ) {
        outputter.outputProperty(this, this.OF, outputComma);
        outputComma = true;
      }
      if ( array.length > 0 ) {
        if ( outputComma ) outputter.out(',');
        outputter.nl().indent().outputPropertyName(this.ARRAY).
            out(':', outputter.postColonStr).output(array, this.of);
      }
      outputter.nl().end('}');
    }
  ]
});
