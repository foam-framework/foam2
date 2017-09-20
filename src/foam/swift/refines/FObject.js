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
      var initImports = function(model) {
        if (!model) return [];
        var parent = foam.lookup(model.extends).model_;
        if (parent.id == model.id) return [];
        return model.swiftImports.concat(initImports(parent));
      };

      var impls = [this.model_.swiftExtends].concat(
          this.model_.swiftImplements,
          (this.model_.implements || []).map(function(i) {
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
            var a = this.getSuperAxiomByName(p.name);
            return !a || foam.core.internal.InterfaceMethod.isInstance(a);
          }.bind(this))
          .filter(function(p) {
            return !!p.swiftCode;
          }.bind(this));

      var multiton = this.getOwnAxiomsByClass(foam.pattern.Multiton);
      multiton = multiton.length ? multiton[0] : null;

      var classInfoCreate = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(swiftName, multiton) {/*
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
          */}), '', ['swiftName', 'multiton']).apply(this, [this.model_.swiftName, multiton]).trim();
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
                .filter(function(a) { return a.swiftAxiomName })
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
            body: classInfoCreate,
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

      var clearPropertyBody = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(properties) {/*
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
          */}), '', ['properties']).apply(this, [properties]).trim();
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
        body: clearPropertyBody,
      }));

      var hasOwnPropertyBody = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(properties) {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftInitedName%>`
<% } %>
  default:
    return super.hasOwnProperty(key)
}
          */}), '', ['properties']).apply(this, [properties]).trim();
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
        body: hasOwnPropertyBody,
      }));

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

      var slotGetterBody = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(properties, methods) {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftSlotName%>`
<% } %>
<% for (var i = 0, p; p = methods[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftSlotName%>`
<% } %>
  default:
    return super.getSlot(key: key)
}
          */}), '', ['properties', 'methods']).apply(this, [properties, methods]).trim();
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
        body: slotGetterBody,
      }));

      var setterBody = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(properties) {/*
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

      var actions = this.getOwnAxiomsByClass(foam.core.Action)
          .filter(function(p) {
            return !this.getSuperAxiomByName(p.name);
          }.bind(this));

      var exports = this.getOwnAxiomsByClass(foam.core.Export)
          .filter(function(p) {
            return !this.getSuperAxiomByName(p.name);
          }.bind(this));
      if (exports.length) {
        var exportsBody = foam.templates.TemplateUtil.create().compile(
            foam.String.multiline(function(exports) {/*
var args = super._createExports_()
<% for (var i = 0, p; p = exports[i]; i++) { %>
args["<%=p.exportName%>"] = <%=p.exportName%>$
<% } %>
return args
            */}), '', ['exports']).apply(this, [exports]).trim();
        cls.methods.push(foam.swift.Method.create({
          override: true,
          name: '_createExports_',
          body: exportsBody,
          returnType: '[String:Any?]',
        }));
      }

      return cls;
    },
  ],
});
