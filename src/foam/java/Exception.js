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
      console.error(model)

      if ( this.name == 'AbstractException' && this.package == 'foam.core' ) {
        this.extends = 'java.lang.Exception'
      } else {
        this.extends = model.extends
      }

      // By default, extend java.lang.Exception
      // TODO: Implementation of AbstractExceptions could be handled here
      /*
      cls.extends = this.model_.extends === 'FObject' ?
        'java.lang.Exception' : this.model_.extends;
        */
    },
    function buildConstructor_() {
      var superArgs = this.of_.model_.javaSuperArgs || [];
      var constructorArgs = this.of_.model_.javaConstructorArgs || [];

      // TODO: error here if a superArg isn't in constructorArgs

      // TODO: The two snippets below for generating
      // constructor arguments could be decoupled from
      // this to be used for other similar features.

      // Generate setter strings for properties (used in constructor)
      var argSetterMap = {};
      var argObjectMap = {};
      this.of_.getAxiomsByClass(foam.core.Property).forEach(p => {
        argSetterMap[p.name] = 'this.set' +
          foam.String.capitalize(p.name) +
          '('+p.name+'_)';
        argObjectMap[p.name] = {
          name: p.name+'_',
          type: p.javaType
        }
      });

      var superConstructor = 'super(' +
        superArgs.map(name => name + '_').join(',') + ');';
      var setters = constructorArgs
        .map(name => argSetterMap[name]).join(';\n') + ';';

      this
        .method({
          visibility: 'public',
          name: this.name,
          args: constructorArgs.map(name => argObjectMap[name]),
          body: superConstructor + '\n' + setters
        })
    },
    function getCorrectExtends_() {
      // The javaExceptionExtends property always overrides
      if ( this.of.model_.javaExceptionExtends ) {
        return this.of.model_.javaExceptionExtends
      }

      if ( this.extendsException() ) {
        return this.of.model_.extends;
      }

      return 'java.lang.Exception';
    },
    function extendsException() {
      return foam.core.AbstractException.isSubClass(this.__context__.lookup(this.of.model_.extends));
    },
    function buildJavaClass() {
      // TODO Build the native java class for an exception here, will need to deep copy this
      console.log("NPTAG")
      return this;
    }
  ]
});