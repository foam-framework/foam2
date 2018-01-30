/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.json2',
  name: 'Deserializer',
  properties: [
    {
      class: 'Boolean',
      name: 'parseFunctions',
      value: false
    }
  ],
  methods: [
    function aparseString(x, str) {
      return this.aparse(x, JSON.parse(str));
    },
    function aparse(x, v) {
      // TODO: References
      return this.parse(x, v);
    },
    function parse(x, v) {
      var type = foam.typeOf(v);

      if ( type == foam.Object ) {
        if ( ! foam.Undefined.isInstance(v["$UNDEF"]) ) return undefined;
        if ( ! foam.Undefined.isInstance(v["$DATE$"]) ) {
          var d = new Date();
          d.setTime(v["$DATE"]);
          return d;
        }
        if ( ! foam.Undefined.isInstance(v["$FUNC$"]) ) {
          if ( this.parseFunctions ) {
            var name = v.name;
            var args = v.args;
            var body = v.body;
            var f = Function.apply(null, args.concat(body));
            if ( name ) foam.Function.setName(f, name);
            return f;
          }

          return null;
        }
        if ( ! foam.Undefined.isInstance(v["$INST$"]) ) {
          // Is an instance of the class defined by $INST$ key
          var cls = this.parse(x, v["$INST$"]);
        }
        if ( ! foam.Undefined.isInstance(v["$CLS$"]) ) {
          // Defines a class referenced by $CLS$ key
          return foam.lookup(v["$CLS$"]);
        }

        var keys = Object.keys(v);
        var args = {}
        for ( var i = 0 ; i < keys.length ; i++ ) {
          if ( keys[i] == '$INST$' ) continue;

          args[keys[i]] = this.parse(x, v[keys[i]]);
        }

        return cls ?
          cls.create(args, x) :
          args;

      } else if ( type == foam.Array ) {
        for ( var i = 0 ; i < v.length ; i++ ) {
          v[i] = this.parse(x, v[i]);
        }
        return v;
/*      } else if ( type == foam.Null ) {
      } else if ( type == foam.Number ) {
      } else if ( type == foam.String ) {
      } else if ( type == foam.Boolean ) { */
      } else {
        return v;
      }
    }
  ]
});
