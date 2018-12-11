/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.json2',
  name: 'Deserializer',
  imports: [
    'aref',
    'acreate'
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'parseFunctions',
      value: true
    },
    {
      name: 'asyncFunctionConstructor',
      factory: function() {
        return (async function(){}).constructor;
      }
    }
  ],
  methods: [
    function aparseString(x, str) {
      return this.aparse(x, JSON.parse(str));
    },
    async function aparse(x, v) {
      var type = foam.typeOf(v);

      if ( type == foam.Object ) {
        if ( ! foam.Undefined.isInstance(v["$UNDEF"]) ) return undefined;
        if ( ! foam.Undefined.isInstance(v["$DATE$"]) ) {
          var d = new Date();
          d.setTime(v["$DATE"]);
          return d;
        }
        if ( ! foam.Undefined.isInstance(v["$REGEXP$"]) ) {
          return new RegExp(v["$REGEXP$"]);
        }
        if ( ! foam.Undefined.isInstance(v["$FUNC$"]) ) {
          if ( this.parseFunctions ) {
            var name = v.name;
            var args = v.args;
            var body = v.body;
            var async = v.async;
            var constructor = async ? this.asyncFunctionConstructor : Function;
            var f = constructor.apply(null, args.concat(body));
            if ( name ) foam.Function.setName(f, name);
            return f;
          }

          return null;
        }
        if ( ! foam.Undefined.isInstance(v["$MMETHOD$"]) ) {
          if ( this.parseFunctions ) {
            var map = v["map"];
            var defaultMethod = v["default"];

            return defaultMethod ?
              foam.mmethod(map, defaultMethod) :
              foam.mmethod(map);
          }
        }
        if ( ! foam.Undefined.isInstance(v["$CLS$"]) ) {
          // Defines a class referenced by $CLS$ key
          return this.aref(v["$CLS$"]);
          return foam.lookup(v["$CLS$"]);
        }
        if ( ! foam.Undefined.isInstance(v["$INST$"]) ) {
          // Is an instance of the class defined by $INST$ key
          var cls = v["$INST$"];
        }

        var keys = Object.keys(v);
        var args = {}
        for ( var i = 0 ; i < keys.length ; i++ ) {
          if ( keys[i] == '$INST$' ) continue;

          args[keys[i]] = await this.aparse(x, v[keys[i]]);
        }

        return cls ?
          await this.acreate(cls, args) :
          args;

      } else if ( type == foam.Array ) {
        for ( var i = 0 ; i < v.length ; i++ ) {
          v[i] = await this.aparse(x, v[i]);
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
