/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.LIB({
  name: 'foam.core.FObject',
  methods: [
    function toSwiftClass() {
      if ( !this.model_.generateSwift ) return foam.swift.EmptyClass.create()
      var templates = foam.swift.FObjectTemplates.create();

      var initImports = function(model) {
        if (!model) return [];
        var parent = foam.lookup(model.extends).model_;
        if (parent.id == model.id) return [];
        return model.swiftImports.concat(initImports(parent));
      };

      var impls = [this.model_.swiftExtends].concat(
          this.model_.swiftImplements,
          (this.model_.implements || [])
          .filter(function(i) {
            return foam.core.InterfaceModel.isInstance(
                foam.lookup(i.path).model_)
          })
          .map(function(i) {
            return foam.lookup(i.path).model_.swiftName;
          }));

      var cls = foam.lookup('foam.swift.SwiftClass').create({
        name: this.model_.swiftName,
        imports: ['Foundation'].concat(initImports(this.model_)),
        implements: impls,
        visibility: 'public',
        code: this.model_.swiftCode,
      });
      this.getOwnAxioms().forEach(function(axiom) {
        if ( axiom.writeToSwiftClass ) axiom.writeToSwiftClass(cls, this.getSuperAxiomByName(axiom.name));
      }.bind(this));

      var properties = this.getOwnAxiomsByClass(foam.core.Property)
          .filter(function(p) {
            return !this.getSuperAxiomByName(p.name);
          }.bind(this));
      var methods = this.getOwnAxiomsByClass(foam.core.Method)
          .filter(function(p) {
            return p.name != 'init';
          }.bind(this))
          .filter(function(p) {
            return !!p.swiftSupport;
          }.bind(this));
      var actions = this.getOwnAxiomsByClass(foam.core.Action)
          .filter(function(p) {
            return !this.getSuperAxiomByName(p.name);
          }.bind(this));

      var multiton = this.getOwnAxiomsByClass(foam.pattern.Multiton);
      multiton = multiton.length ? multiton[0] : null;

      var classInfo = foam.swift.SwiftClass.create({
        visibility: 'private',
        name: 'ClassInfo_',
        implements: ['ClassInfo'],
        fields: [
          foam.swift.Field.create({
            lazy: true,
            name: 'id',
            type: 'String',
            defaultValue: '"' + this.model_.id + '"',
          }),
          foam.swift.Field.create({
            lazy: true,
            name: 'label',
            type: 'String',
            defaultValue: '"' + this.model_.label + '"',
          }),
          foam.swift.Field.create({
            lazy: true,
            name: 'parent',
            type: 'ClassInfo?',
            defaultValue: this.model_.swiftExtends == 'AbstractFObject' ?
                'nil' : this.model_.swiftExtends + '.classInfo()',
          }),
          foam.swift.Field.create({
            lazy: true,
            name: 'ownAxioms',
            type: '[Axiom]',
            defaultValue: '[' +
              this.getOwnAxioms()
                .filter(function(a) { return a.swiftSupport })
                .map(function(a) { return a.swiftAxiomName }) +
            ']',
          }),
          foam.swift.Field.create({
            lazy: true,
            name: 'cls',
            type: 'AnyClass',
            defaultValue: this.model_.swiftName + '.self',
          }),
        ],
        methods: [
          foam.swift.Method.create({
            name: 'create',
            returnType: 'Any',
            args: [
              foam.swift.Argument.create({
                externalName: 'args',
                localName: 'args',
                defaultValue: '[:]',
                type: '[String:Any?]',
              }),
              foam.swift.Argument.create({
                externalName: 'x',
                localName: 'x',
                type: 'Context',
              }),
            ],
            body: templates.classInfoCreate(this.model_.swiftName, multiton),
          }),
        ],
      });
      if (multiton) {
        classInfo.fields.push(foam.swift.Field.create({
          defaultValue: '[:]',
          lazy: true,
          type: '[String:FObject]',
          name: 'multitonMap',
        }));
        classInfo.fields.push(foam.swift.Field.create({
          defaultValue: this.getAxiomByName(multiton.property).swiftAxiomName,
          lazy: true,
          type: 'PropertyInfo',
          name: 'multitonProperty',
        }));
      }
      cls.classes.push(classInfo);
      cls.fields.push(foam.swift.Field.create({
        static: true,
        visibility: 'private',
        name: 'classInfo_',
        type: 'ClassInfo',
        defaultValue: 'ClassInfo_()',
      }));
      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'ownClassInfo',
        visibility: 'public',
        returnType: 'ClassInfo',
        body: 'return ' + this.model_.swiftName + '.classInfo_',
      }));
      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'classInfo',
        visibility: 'public',
        class: true,
        returnType: 'ClassInfo',
        body: 'return ' + this.model_.swiftName + '.classInfo_',
      }));

      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'clearProperty',
        visibility: 'public',
	args: [
          {
            localName: 'key',
            type: 'String',
          },
	],
        body: templates.clearPropertyBody(properties),
      }));

      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'hasOwnProperty',
        visibility: 'public',
	args: [
          {
            localName: 'key',
            type: 'String',
          },
	],
        returnType: 'Bool',
        body: templates.hasOwnPropertyBody(properties),
      }));

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
        body: templates.getterBody(properties),
      }));

      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'getSlot',
        visibility: 'public',
	args: [
          {
            externalName: 'key',
            localName: 'key',
            type: 'String',
          },
	],
        returnType: 'Slot?',
        body: templates.slotGetterBody(properties, methods, actions),
      }));

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
        body: templates.setterBody(properties),
      }));

      var exports = this.getOwnAxiomsByClass(foam.core.Export)
          .filter(function(p) {
            return !this.getSuperAxiomByName(p.name);
          }.bind(this));
      if (exports.length) {
        cls.methods.push(foam.swift.Method.create({
          override: true,
          name: '_createExports_',
          body: templates.exportsBody(exports),
          returnType: '[String:Any?]',
        }));
      }

      return cls;
    },
  ],
});

foam.CLASS({
  package: 'foam.swift',
  name: 'FObjectTemplates',
  templates: [
    {
      name: 'exportsBody',
      args: ['exports'],
      template: function() {/*
var args = super._createExports_()
<% for (var i = 0, p; p = exports[i]; i++) { %>
args["<%=p.exportName%>"] = <%=p.exportName%>$
<% } %>
return args
      */},
    },
    {
      name: 'setterBody',
      args: ['properties'],
      template: function() {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftSlotName%>":
    <%=p.swiftSlotName%> = value as! Slot
    return
  case "<%=p.swiftName%>":
  <% if ( p.swiftExpression ) { %>
    if <%= p.swiftExpressionSubscriptionName %> != nil {
      for s in self.<%=p.swiftExpressionSubscriptionName%>! { s.detach() }
    }
  <% } %>
    let oldValue: Any? = <%=p.swiftInitedName%> ? self.`<%=p.swiftName%>` : nil
    <%=p.swiftValueName%> = <%=p.swiftPreSetFuncName%>(oldValue, <%=p.swiftAdaptFuncName%>(oldValue, value))
    <%=p.swiftInitedName%> = true
    <%=p.swiftPostSetFuncName%>(oldValue, <%=p.swiftValueName%>)
    if hasListeners(["propertyChange", "<%=p.swiftName%>"]) && !FOAM_utils.equals(oldValue, <%=p.swiftValueName%>) {
      _ = pub(["propertyChange", "<%=p.swiftName%>", <%=p.swiftSlotName%>])
    }
    return
<% } %>
  default: break
}
super.set(key: key, value: value)
      */}
    },
    {
      name: 'slotGetterBody',
      args: ['properties', 'methods', 'actions'],
      template: function() {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftSlotName%>`
<% } %>
<% for (var i = 0, p; p = methods[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftSlotName%>`
<% } %>
<% for (var i = 0, p; p = actions[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftSlotName%>`
<% } %>
  default:
    return super.getSlot(key: key)
}
      */}
    },
    {
      name: 'getterBody',
      args: ['properties'],
      template: function() {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftName%>`
<% } %>
  default:
    return super.get(key: key)
}
      */},
    },
    {
      name: 'hasOwnPropertyBody',
      args: ['properties'],
      template: function() {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftInitedName%>`
<% } %>
  default:
    return super.hasOwnProperty(key)
}
      */},
    },
    {
      name: 'clearPropertyBody',
      args: ['properties'],
      template: function() {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>":
    <%= p.swiftInitedName %> = false
    <%= p.swiftValueName %> = nil

  <% if ( p.swiftExpression ) { %>
    if <%= p.swiftExpressionSubscriptionName %> != nil {
      for s in self.<%=p.swiftExpressionSubscriptionName%>! { s.detach() }
    }
    <%= p.swiftExpressionSubscriptionName %> = nil
  <% } %>

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "<%=p.swiftName%>"]) {
      _ = pub(["propertyChange", "<%=p.swiftName%>", <%=p.swiftSlotName%>])
    }
    break
<% } %>
  default:
    super.clearProperty(key)
}
      */},
    },
    {
      name: 'classInfoCreate',
      args: ['swiftName', 'multiton'],
      template: function() {/*
<% if ( multiton ) { %>
if let key = args[multitonProperty.name] as? String,
   let value = multitonMap[key] {
  return value
} else {
  let value = <%=swiftName%>(args, x)
  if let key = multitonProperty.get(value) as? String {
    multitonMap[key] = value
  }
  return value
}
<% } else { %>
return <%=swiftName%>(args, x)
<% } %>
      */}
    },
  ],
})
