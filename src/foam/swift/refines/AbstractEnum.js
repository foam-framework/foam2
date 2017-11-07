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

          var templates = foam.swift.EnumTemplates.create();
          var axioms = this.getAxiomsByClass(foam.core.Property);
          for (var i = 0; i < axioms.length; i++) {
            var a = axioms[i];
            cls.fields.push(
              foam.swift.Field.create({
                type: a.swiftType,
                name: a.swiftName,
                getter: templates.propertyGetter(a, this.VALUES),
                visibility: 'public',
              })
            );
          }

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

foam.CLASS({
  package: 'foam.swift',
  name: 'EnumTemplates',
  templates: [
    {
      name: 'propertyGetter',
      args: ['property', 'values'],
      template: function() {/*
<% var p = property.clone() %>
switch self {
<% values.forEach(function(v) { %>
  <% p.value = v[p.name] %>
  case .<%=v.name%>: return <%=p.swiftValue%>
<% }) %>
}
      */},
    },
  ],
})
