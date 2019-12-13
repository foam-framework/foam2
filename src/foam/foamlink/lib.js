foam.LIB({
  name: 'foam.foamlink.lib',

  methods: [
    function addRoot(newRoot) {
      if ( ! foam.foamlink.lib.roots ) foam.foamlink.lib.roots = [];
      foam.foamlink.lib.roots.push(newRoot);
    },
    {
      name: 'processSourceForMeta',
      documentation: `
        This function loads a FOAM source file using a context scope in a
        similar manner to which ModelFileDAO does already, however instead of
        attempting to create a FOAM model it will only process the model id.

        This is done by using an artificial 'foam' variable that implements
        model declaration functions (CLASS, INTERFACE, etc) and just takes the
        'name' and 'package' properties of the model definition object.

        Additionally, the 'foam' variable is a proxy function, which allows
        calls to axiom constructors (foam.u2.CSS.create for example) to be
        invoked without producing errors.
      `,
      code: function (text) {
        // This is the information we want
        var idsPresent = {};

        // This is the scope of the loaded file
        var context = {
          // Create using the real foam object's prototype (thanks Mike)
          foam_: Object.create({})
        };

        // TODO: DRY list of FOAM declaration types if possible
        [ 'CLASS','INTERFACE','ENUM','SCRIPT','RELATIONSHIP', 'LIB'
        ].forEach((typ) => {
          context.foam_[typ] = (m) => {
            var id = m.package
              ? m.package + '.' + m.name
              : m.name || '';
            idsPresent[id] = { type: typ };
          };
        });

        context.foam_.LIB = (m) => {
          idsPresent[m.name] = {type: 'LIB'}
        };

        var srcMeta = `
          //@ sourceURL=filename_unknown.js
        `

        // Since FOAM is already running, there are certain things we don't
        // want source files for FOAM itself doing in this loader.
        var restoreObjectDefineProperty__ = Object.defineProperty;
        Object.defineProperty = () => {};

        // The code below won't have access to 'foam', so we need to pass its
        // requirements through this object.
        var requiredVars = {
          'roots': foam.foamlink.lib.roots
        }

        try {
          (function() {
            // console.log(proxyHack + text);
            with ( context ) {

        // Unfortunately, without parsing the Javascript AST, it is currently
        // not possible to determine axiom dependancies before invoking the
        // code which defines the model. Axioms are constructed when the model
        // file is loaded rather than when the model object is constructed,
        // so this poses a problem for a fake load that just gets meta info.

        // To solve this problem, a proxy foam that always resolves getters is
        // used; this prevents erros from being thrown on axiom constructors.
              
              var __infiniteProxy__ = null;
              __infiniteProxy__ = (source) => {
                var p = new Proxy(source, {
                  get: function(obj, name) {
                    var newObj = function(){};
                    newObj.parent = obj;
                    newObj.myName = name;
                    return __infiniteProxy__(newObj);
                  },
                  apply: function(obj, thisArg, argumentList) {
                    if ( obj.myName === 'toString' ) return '';
                    return __infiniteProxy__(obj);
                  },
                  construct: function(obj, args) {
                    return __infiniteProxy__(obj);
                  },
                });
                p[Symbol.toPrimitive] = (hint) => {
                  if ( hint == 'number' ) return 0;
                  if ( hint == 'string' ) return '';
                  return null;
                }
                return p;
              };

              var foam = new Proxy(foam_, {
                get: function(obj, name) {
                  return obj[name] === undefined ? __infiniteProxy__(function(){}) : obj[name];
                },
              });

              for ( var i=0; i < requiredVars.roots.length; i++) {
                eval('var '+requiredVars.roots[i]+' = __infiniteProxy__(function(){})')
              }

              eval(text + srcMeta)
            }
          })();
        } catch (e) {
          throw e;
        } finally {
          Object.defineProperty = restoreObjectDefineProperty__;
        }

        return idsPresent;

      }
    }
  ]
});