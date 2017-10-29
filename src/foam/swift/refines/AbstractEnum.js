/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.AbstractEnum',
  axioms: [
    {
      installInClass: function(cls) {
        cls.toSwiftClass =  function() {
          var cls = foam.swift.Enum.create({
            name: this.model_.swiftName,
            extends: 'Int',
            implements: ['FOAM_enum'],
          });

          cls.fields.push(
            foam.swift.Field.create({
              type: 'Int',
              name: 'ordinal',
              getter: foam.templates.TemplateUtil.create().compile(foam.String.multiline(function() {/*
switch self {
<% values.forEach(function(v) { %>
  case .<%=v.name%>: return <%=v.ordinal%>  
<% }) %>
}
              */}), '', ['values']).apply(this, [this.VALUES]).trim(),
              visibility: 'public',
            }),
            foam.swift.Field.create({
              type: 'String',
              name: 'name',
              getter: foam.templates.TemplateUtil.create().compile(foam.String.multiline(function() {/*
switch self {
<% values.forEach(function(v) { %>
  case .<%=v.name%>: return "<%=v.name%>"
<% }) %>
}
              */}), '', ['values']).apply(this, [this.VALUES]).trim(),
              visibility: 'public',
            }),
            foam.swift.Field.create({
              type: 'String',
              name: 'label',
              getter: foam.templates.TemplateUtil.create().compile(foam.String.multiline(function() {/*
switch self {
<% values.forEach(function(v) { %>
  case .<%=v.name%>: return "<%=v.label%>"
<% }) %>
}
              */}), '', ['values']).apply(this, [this.VALUES]).trim(),
              visibility: 'public',
            })
          );

          this.VALUES.forEach(function(v) {
            cls.values.push(foam.swift.EnumValue.create({
              name: v.name,
            }))
          });

          return cls;
        };
      }
    }
  ],
});
