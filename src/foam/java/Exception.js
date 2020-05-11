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

      // Special case to add newNative method to any instance of
      // AbstractException. The generated code depends on the
      // name of the exception.
      if ( !this.of_.model_.nativeException && foam.core.AbstractException.isSubClass(this.of_) && 
        !( this.of_.model_.name == 'AbstractException' && this.of_.model_.package == 'foam.core') ) {
        
        let exceptionName = foam.String.toNativeExceptionName(this.name)
        this.method({
          visibility: 'public',
          type: 'java.lang.Exception',
          name: 'newNative',
          args: [],
          body: 'return new ' + exceptionName +
            '(this);'
        });
      }

      this.buildConstructor_();

    },
    function fromModel(model) {
      [ // List of attributes to copy from model to Exception
        'name','package','source'
      ].forEach((attr) => this[attr] = model[attr]);

      // TODO AbstractException needs to extend something
      if ( model.package == "foam.core" && model.name == "AbstractException" ) {
        this.extends = "foam.core.AbstractFObject";
      } else {
        this.extends = model.extends;
      }
    },
    function buildConstructor_() {
      let superArgs = this.of_.model_.javaSuperArgs || [];
      let constructorArgs = this.of_.model_.javaConstructorArgs || [];

      // TODO: error here if a superArg isn't in constructorArgs
      // TODO: The two snippets below for generating
      // constructor arguments could be decoupled from
      // this to be used for other similar features.

      // Generate setter strings for properties (used in constructor)
      let argSetterMap = {};
      let argObjectMap = {};
      let args = [];
      let setters = [];
      let superConstructor = '';

      if ( ! this.of_.model_.nativeException ) {
        this.of_.getAxiomsByClass(foam.core.Property).forEach(p => {
          argSetterMap[p.name] = 'this.set' +
            foam.String.capitalize(p.name) +
            '('+p.name+'_)';
          argObjectMap[p.name] = {
            name: p.name+'_',
            type: p.javaType
          }
        });
        
        setters = constructorArgs
          .map(name => argSetterMap[name]).join(';\n') + ';';

        args = constructorArgs.map(name => argObjectMap[name]);
        superConstructor = 'super(' +
          superArgs.map(name => name + '_').join(',') + ');';
      } else {
        this.of_.getAxiomsByClass(foam.core.Property).forEach(p => {
          argSetterMap[p.name] = 'this.set' +
            foam.String.capitalize(p.name) +
            '(data.get'+foam.String.capitalize(p.name)+'())';
          argObjectMap[p.name] = {
            name: p.name+'_',
            type: p.javaType
          }
        });

        setters = Object.keys(argSetterMap)
          .map(key => argSetterMap[key]).join(';\n') + ';';
        
        args = [{
          name: 'data',
          type: foam.String.toFoamExceptionName(this.of_.model_.name)
        }]
        if ( this.of_.model_.name == 'AbstractNativeException' && this.of_.model_.package == 'foam.core' )
          superConstructor = 'super();';
        else
          superConstructor = 'super(data);';
      }

      

      this
        .method({
          visibility: 'public',
          name: this.name,
          args: args,
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
      const pkg = this.of.package;
      const name = foam.String.toNativeExceptionName(this.of.name);
      const id = pkg + "." + name;

      // ? Is this the right way to rename a model?
      this.of.id = id;
      this.of.model_.instance_.name = name;
      this.of.model_.instance_.id = id;
      this.of.model_.extends = this.getCorrectExtends_();
      this.of.name = name;
      this.of.model_.nativeException = true;

      return this.of.buildJavaClass();
    }
  ]
});