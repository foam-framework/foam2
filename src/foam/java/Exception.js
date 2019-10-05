foam.CLASS({
  package: 'foam.java',
  name: 'Exception',
  extends: 'foam.java.Class',

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'name'
    }
  ],

  methods: [
    function buildJavaClass(cls) {
      cls = cls || foam.java.Exception.create();
      cls.package = this.of.package;
      cls.name = this.name;
      cls.extends = this.getCorrectExtends_();
      cls.source = this.of.model_.source;

      // Add property to get FOAM exception
      this.buildFoamExceptionProperty_(cls);
      this.buildConstructor_(cls);

      return cls;
    },
    function buildFoamExceptionProperty_(cls) {
      var name = "foamException";
      var type = 'foam.core.MessageException';
      var privateName = name + '_';
      var capitalized = foam.String.capitalize(name);
      var constantize = foam.String.constantize(name);
      cls
        .field({
          name: privateName,
          type: type,
          visibility: 'protected'
        })
        .method({
          name: 'get' + capitalized,
          type: type,
          visibility: 'public',
          body: 'return ' + privateName + ';'
        })
        .method({
          name: 'set' + capitalized,
          visibility: 'public',
          args: [
            {
              type: type,
              name: 'fObject'
            }
          ],
          type: 'void',
          body: privateName + ' = fObject;'
        });
    },
    function buildConstructor_(cls) {
      var superArgs = this.of.model_.javaSuperArgs || [];

      // TODO: The two snippets below for generating
      // constructor arguments could be decoupled from
      // this to be used for other similar features.

      // Generate getter strings for properties
      var argGetterMap = {};
      this.of.getAxiomsByClass(foam.core.Property).forEach(p => {
        argGetterMap[p.name] = 'foamException.get' +
          foam.String.capitalize(p.name) +
          '()';
      });

      // Generate calls for methods
      this.of.getAxiomsByClass(foam.core.Method).forEach(m => {
        argGetterMap[m.name] = 'foamException.' + m.name + '()';
      });

      // Message is a special case; use property if available, but
      // prefer non-empty constructor argument.
      if ( 'message' in argGetterMap ) {
        argGetterMap["message"] =
          '( message == null || message.equals("") ) '
            + '? foamException.getMessage() : message';
      } else {
        argGetterMap["message"] = "message";
      }

      var superConstructor = 'super(' +
        superArgs.map(val => {
          return argGetterMap[val] || val
        }).join(',') + ');';

      cls
        .method({
          visibility: 'public',
          name: cls.name,
          args: [
            {
              name: 'foamException',
              type: 'foam.core.MessageException'
            },
            {
              name: 'message',
              type: 'String'
            }
          ],
          body: superConstructor + '\n' +
            'foamException_ = foamException;'
        })
    },
    function getCorrectExtends_() {
      // The javaExceptionExtends property always overrides
      if ( this.of.model_.javaExceptionExtends ) {
        return this.of.model_.javaExceptionExtends
      }

      if ( this.extendsException() ) {
        return foam.String.toNativeExceptionName(this.of.model_.extends);
      }

      return 'java.lang.Exception';
    },
    function extendsException() {
      return foam.core.AbstractException.isSubClass(this.__context__.lookup(this.of.model_.extends));
    }
  ]
});