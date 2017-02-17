foam.LIB({
  name: 'foam.core.FObject',
  methods: [
    function toSwiftClass() {
      var cls = foam.lookup('foam.swift.SwiftClass').create({
        name: this.model_.swiftName,
        implements: ['AbstractFObject'],
        visibility: 'public',
      });
      this.getAxioms().forEach(function(axiom) {
        if ( axiom.writeToSwiftClass ) axiom.writeToSwiftClass(cls);
      });
      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'createClassInfo_',
        returnType: 'ClassInfo',
        // TODO Actually make class info.
        body: 'return EmptyClassInfo()',
      }));
      var properties = this.getAxiomsByClass(foam.core.Property);

      var getterBody = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(properties) {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftName%>`
<% } %>
  default:
    return super.get(key: key)
}
          */}), '', ['properties']).apply(this, [properties]).trim();
      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'get',
        visibility: 'public',
	args: [
          {
            externalName: 'key',
            localName: 'key',
            type: 'String',
          },
	],
        returnType: 'Any?',
        body: getterBody,
      }));


      var setterBody = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(properties) {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>":
    let oldValue: Any? = <%=p.swiftInitedName%> ? `<%=p.swiftName%>` : nil
    <%=p.swiftValueName%> = <%=p.swiftPreSetFuncName%>(oldValue, <%=p.swiftAdaptFuncName%>(oldValue, value))
    <%=p.swiftInitedName%> = true
    <%=p.swiftPostSetFuncName%>(oldValue, <%=p.swiftValueName%><%if ( p.swiftType != 'Any?' ) {%> as! <%=p.swiftType%><% } %>)
    _ = pub(["propertyChange", "<%=p.swiftName%>"])
    return
<% } %>
  default: break
}
super.set(key: key, value: value)
          */}), '', ['properties']).apply(this, [properties]).trim();
      cls.methods.push(foam.swift.Method.create({
        visibility: 'public',
        override: true,
        name: 'set',
	args: [
          {
            externalName: 'key',
            localName: 'key',
            type: 'String',
          },
          {
            externalName: 'value',
            localName: 'value',
            type: 'Any?',
          },
	],
        body: setterBody,
      }));

      return cls;
    },
  ],
  templates: [
  ],
});
