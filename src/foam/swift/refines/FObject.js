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

      cls.classes.push(foam.swift.SwiftClass.create({
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
            defaultValue: this.model_.swiftExtends + '.classInfo()',
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
        ],
      }));
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
          foam.String.multiline(function(properties) {/*
switch key {
<% for (var i = 0, p; p = properties[i]; i++) { %>
  case "<%=p.swiftName%>": return `<%=p.swiftSlotName%>`
<% } %>
  default:
    return super.getSlot(key: key)
}
          */}), '', ['properties']).apply(this, [properties]).trim();
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

      var callActionBody = foam.templates.TemplateUtil.create().compile(
          foam.String.multiline(function(actions) {/*
switch key {
<% for (var i = 0, p; p = actions[i]; i++) { %>
  case "<%=p.swiftName%>":
    <%=p.swiftName%>()
    break
<% } %>
  default:
    super.callAction(key: key)
}
          */}), '', ['actions']).apply(this, [actions]).trim();
      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'callAction',
        visibility: 'public',
	args: [
          {
            externalName: 'key',
            localName: 'key',
            type: 'String',
          },
	],
        body: callActionBody,
      }));

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
