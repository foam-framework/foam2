foam.CLASS({
  refines: 'foam.core.InnerClass',
  requires: [
    'foam.swift.Method',
    'foam.swift.Argument',
  ],
  methods: [
    function writeToSwiftClass(cls) {
      var innerClass = this.model.buildClass();
      var innerSwiftClass = innerClass.toSwiftClass();
      innerSwiftClass.imports = [];
      cls.classes.push(innerSwiftClass);

      cls.methods.push(this.Method.create({
        name: this.model.swiftName + '_create',
        returnType: this.model.swiftName,
        visibility: 'public',
	body: this.swiftInitializer(),
        args: [
          this.Argument.create({
            localName: 'args',
            defaultValue: '[:]',
            type: '[String:Any?]',
          }),
        ],
      }));
    }
  ],
  templates: [
    {
      name: 'swiftInitializer',
      args: [],
      template: function() {/*
return __subContext__.create(
    type: <%=this.model.swiftName%>.self, args: args) as! <%=this.model.swiftName%>
      */},
    },
  ],
});
