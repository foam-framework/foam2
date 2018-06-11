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

          // push id field
          cls.fields.push(
            foam.swift.Field.create({
              type: 'String',
              name: 'classId',
              getter: `return "${this.model_.id}";`,
              visibility: 'public'
            })
          );

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

          cls.method(foam.swift.Method.create({
            name: 'fromOrdinal',
            args: [
              foam.swift.Argument.create({
                type: 'Int',
                localName: 'ordinal',
              })
            ],
            static: true,
            returnType: this.model_.swiftName + '!',
            body: templates.fromOrdinal(this.VALUES),
          }))


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
    {
      name: 'fromOrdinal',
      args: ['values'],
      template: function() {/*
switch ordinal {
<% values.forEach(function(v) { %>
  case <%=v.ordinal%>: return .<%=v.name%>
<% }) %>
  default: return nil
}
      */},
    },
  ],
});
