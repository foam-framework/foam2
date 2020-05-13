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
    function fromFObjectClass(of) {
      this.fromModel(of.model_);
      this.of_ = of;

      var flagFilter = foam.util.flagFilter(['java']);
      var axioms = of.getOwnAxioms().filter(flagFilter);

      for ( var i = 0 ; i < axioms.length ; i++ ) {
        axioms[i].buildJavaClass && axioms[i].buildJavaClass(this);
      }

      this.buildConstructor_();
    },
    function fromModel(model) {
      [ // List of attributes to copy from model to Exception
        'name','package','source'
      ].forEach((attr) => this[attr] = model[attr]);

      this.name = foam.String.toNativeExceptionName(model.name);

      if (model.name == 'AbstractException' && model.package == 'foam.core' ) {
        this.extends = "java.lang.RuntimeException";
        this.field({
          name: 'foamException',
          type: 'foam.core.FObject'
        });
        this.method({
          visibility: 'public',
          name: 'getFoamException',
          args: [],
          type: 'foam.core.FObject',
          body: 'return foamException;'
        })
      } else {
        this.extends = "foam.core.AbstractNativeException";
      }
    },
    function buildConstructor_() {
      let argSetterMap = {};
      let argObjectMap = {};
      let setters = [];
      let superConstructor = '';

      this.of_.getAxiomsByClass(foam.core.Property).forEach(p => {
        argSetterMap[p.name] = 'this.set' +
          foam.String.capitalize(p.name) +
          '(data.get'+foam.String.capitalize(p.name)+'())';
        argObjectMap[p.name] = {
          name: p.name+'_',
          type: p.javaType
        }
      });

      if ( this.name == 'AbstractNativeException' && this.package == 'foam.core' ) {
        argSetterMap['foamException'] = 'this.foamException = data'
      }

      setters = Object.keys(argSetterMap)
        .map(key => argSetterMap[key]).join(';\n') + ';';

      if ( this.name == 'AbstractNativeException' && this.package == 'foam.core' )
        superConstructor = 'super();';
      else
        superConstructor = 'super(data);';

      this.method({
          visibility: 'public',
          name: this.name,
          args: [{
            name: 'data',
            type: foam.String.toFoamExceptionName(this.of_.model_.name)
          }],
          body: superConstructor + '\n' + setters
        })
    },
    function getCorrectExtends_() {
      // The javaExceptionExtends property always overrides
      if ( this.of_.model_.javaExceptionExtends ) {
        return this.of_.model_.javaExceptionExtends
      }

      if ( this.extendsException() ) {
        return this.of_.model_.extends;
      }

      return 'java.lang.RuntimeException';
    },
    function extendsException() {
      return foam.core.AbstractException.isSubClass(this.__context__.lookup(this.of_.model_.extends));
    },
    function buildJavaClass() {
      // ? Is this a necessary function
      return this;
    }
  ]
});