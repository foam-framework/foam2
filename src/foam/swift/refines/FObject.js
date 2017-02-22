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
      var cls = foam.lookup('foam.swift.SwiftClass').create({
        name: this.model_.swiftName,
        imports: [
          'Foundation',
        ],
        implements: [this.model_.swiftExtends],
        visibility: 'public',
      });
      this.getOwnAxioms().forEach(function(axiom) {
        if ( axiom.writeToSwiftClass ) axiom.writeToSwiftClass(cls);
      });
      cls.methods.push(foam.swift.Method.create({
        override: true,
        name: 'createClassInfo_',
        class: true,
        returnType: 'ClassInfo',
        // TODO Actually make class info.
        body: 'return EmptyClassInfo()',
      }));
      var properties = this.getOwnAxiomsByClass(foam.core.Property)
          .filter(function(p) {
            return !this.getSuperAxiomByName(p.name);
          }.bind(this));

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
