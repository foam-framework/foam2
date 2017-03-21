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

foam.CLASS({
  refines: 'foam.core.Property',
  requires: [
    'foam.swift.Field',
    'foam.swift.SwiftClass',
    'foam.swift.Method',
    'foam.swift.Argument',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftView',
    },
    {
      class: 'String',
      name: 'swiftSlotLinkSubName',
      expression: function(swiftName) { return swiftName + '_Value_Sub_'; },
    },
    {
      class: 'String',
      name: 'swiftSlotValueName',
      expression: function(swiftName) { return swiftName + '_Value_'; },
    },
    {
      class: 'String',
      name: 'swiftSlotName',
      expression: function(swiftName) { return swiftName + '$'; },
    },
    {
      class: 'String',
      name: 'swiftInitedName',
      expression: function(swiftName) { return '_' + swiftName + '_inited_'; },
    },
    {
      class: 'String',
      name: 'swiftValueName',
      expression: function(swiftName) { return '_' + swiftName + '_'; },
    },
    {
      class: 'String',
      name: 'swiftValueType',
      expression: function(swiftType) {
        return swiftType + (swiftType.match(/[?!]$/) ? '' : '!')
      },
    },
    {
      class: 'String',
      name: 'swiftType',
      value: 'Any?',
    },
    {
      class: 'String',
      name: 'swiftFactory'
    },
    {
      class: 'String',
      name: 'swiftFactoryName',
      expression: function(swiftName) { return '_' + swiftName + '_factory_'; },
    },
    {
      class: 'String',
      name: 'swiftValue',
    },
    {
      class: 'String',
      name: 'swiftPreSet',
      expression: function() {
        return 'return newValue';
      },
    },
    {
      class: 'String',
      name: 'swiftPreSetFuncName',
      expression: function(swiftName) { return '_' + swiftName + '_preSet_'; },
    },
    {
      class: 'String',
      name: 'swiftPostSet',
    },
    {
      class: 'String',
      name: 'swiftPostSetFuncName',
      expression: function(swiftName) { return '_' + swiftName + '_postSet_'; },
    },
    {
      class: 'String',
      name: 'swiftRequiresCast',
      expression: function(swiftType) {
        return swiftType != 'Any?' && swiftType != 'Any!';
      },
    },
    {
      class: 'StringArray',
      name: 'swiftExpressionArgs',
    },
    {
      class: 'String',
      name: 'swiftExpression',
    },
    {
      class: 'String',
      name: 'swiftExpressionSubscriptionName',
      expression: function(swiftName) { return '_' + swiftName + '_expression_'; },
    },
    {
      class: 'String',
      name: 'swiftAdapt',
      expression: function(swiftType, swiftRequiresCast) {
        if (!swiftRequiresCast) return 'return newValue';
        return 'return newValue as! ' + swiftType;
      },
    },
    {
      class: 'String',
      name: 'swiftAdaptFuncName',
      expression: function(swiftName) { return '_' + swiftName + '_adapt_'; },
    },
    {
      class: 'String',
      name: 'swiftAxiomName',
      expression: function(swiftName) { return foam.String.constantize(swiftName); },
    },
    {
      class: 'String',
      name: 'swiftJsonParser',
      value: 'nil',
    },
    {
      class: 'Boolean',
      name: 'swiftWeak',
      value: false,
    },
    {
      class: 'String',
      name: 'swiftCompareValues',
      factory: function() {
        return foam.String.multiline(function() {/*
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        */});
      },
    },
  ],
  methods: [
    function writeToSwiftClass(cls, superAxiom) {
      var isOverride = !!superAxiom;
      cls.fields.push(this.Field.create({
        visibility: 'public',
        override: isOverride,
        name: this.swiftName,
        type: this.swiftType,
        getter: this.swiftGetter(),
        setter: this.swiftSetter(),
      }));
      if ( !isOverride ) {
        if (this.swiftExpression) {
          cls.fields.push(this.Field.create({
            name: this.swiftExpressionSubscriptionName,
            type: '[Subscription]?',
          }));
        }
        cls.fields.push(this.Field.create({
          name: this.swiftValueName,
          type: this.swiftValueType,
          defaultValue: 'nil',
          weak: this.swiftWeak,
        }));
        cls.fields.push(this.Field.create({
          name: this.swiftInitedName,
          type: 'Bool',
          defaultValue: 'false',
        }));
        cls.fields.push(this.Field.create({
          visibility: 'public',
          static: true,
          final: true,
          name: this.swiftAxiomName,
          type: 'PropertyInfo',
          initializer: this.swiftPropertyInfoInit(),
        }));
        cls.fields.push(this.Field.create({
          visibility: 'private',
          name: this.swiftSlotValueName,
          type: 'PropertySlot',
          lazy: true,
          initializer: this.swiftSlotInitializer()
        }));
        cls.fields.push(this.Field.create({
          visibility: 'private(set) public',
          name: this.swiftSlotLinkSubName,
          type: 'Subscription?',
        }));
        cls.fields.push(this.Field.create({
          visibility: 'public',
          name: this.swiftSlotName,
          type: 'Slot',
          getter: 'return self.' + this.swiftSlotValueName,
          setter: this.swiftSlotSetter(),
        }));
      }
      if (this.swiftFactory) {
        cls.methods.push(this.Method.create({
          visibility: 'private',
          name: this.swiftFactoryName,
          returnType: this.swiftType,
          body: this.swiftFactory,
        }));
      }
      cls.methods.push(this.Method.create({
        visibility: 'private',
        name: this.swiftAdaptFuncName,
        returnType: this.swiftType,
        body: this.swiftAdapt,
        args: [
          {
            externalName: '_',
            localName: 'oldValue',
            type: 'Any?',
          },
          {
            externalName: '_',
            localName: 'newValue',
            type: 'Any?',
          },
        ],
      }));
      cls.methods.push(this.Method.create({
        visibility: 'private',
        name: this.swiftPreSetFuncName,
        returnType: this.swiftType,
        body: this.swiftPreSet,
        args: [
          {
            externalName: '_',
            localName: 'oldValue',
            type: 'Any?',
          },
          {
            externalName: '_',
            localName: 'newValue',
            type: this.swiftType,
          },
        ],
      }));
      cls.methods.push(this.Method.create({
        visibility: 'private',
        name: this.swiftPostSetFuncName,
        body: this.swiftPostSet,
        args: [
          {
            externalName: '_',
            localName: 'oldValue',
            type: 'Any?',
          },
          {
            externalName: '_',
            localName: 'newValue',
            type: this.swiftType,
          },
        ],
      }));
    },
  ],
  templates: [
    {
      name: 'swiftSlotInitializer',
      args: [],
      template: function() {/*
return PropertySlot([
  "object": self,
  "propertyName": "<%=this.swiftName%>",
])
      */},
    },
    {
      name: 'swiftSetter',
      args: [],
      template: function() {/*
self.set(key: "<%=this.swiftName%>", value: value)
      */},
    },
    {
      name: 'swiftGetter',
      args: [],
      template: function() {/*
if <%=this.swiftInitedName%> {
  return <%=this.swiftValueName%><% if ( this.swiftRequiresCast ) { %>!<% } %>
}
<% if ( this.swiftFactory ) { %>
self.set(key: "<%=this.swiftName%>", value: <%=this.swiftFactoryName%>())
return <%=this.swiftValueName%><% if ( this.swiftRequiresCast ) { %>!<% } %>
<% } else if ( this.swiftExpression ) { %>
if <%= this.swiftExpressionSubscriptionName %> != nil { return <%= this.swiftValueName %> }
let valFunc = { () -> <%= this.swiftValueType %> in
  <% for (var i = 0, arg; arg = this.swiftExpressionArgs[i]; i++) { %>
  let <%=arg%> = self.<%=arg%>
  <% } %>
  <%= this.swiftExpression %>
}
let detach: Listener = { _,_ in
  if self.<%=this.swiftExpressionSubscriptionName%> == nil { return }
  for s in self.<%=this.swiftExpressionSubscriptionName%>! {
    s.detach()
  }
  self.<%=this.swiftExpressionSubscriptionName%> = nil
  self.clearProperty("<%=this.swiftName%>")
}
<%=this.swiftExpressionSubscriptionName%> = [
  <% for (var i = 0, arg; arg = this.swiftExpressionArgs[i]; i++) { %>
  <%=arg%>$.swiftSub(detach),
  <% } %>
]
<%=this.swiftValueName%> = valFunc()
return <%=this.swiftValueName%><% if ( this.swiftRequiresCast ) { %>!<% } %>
<% } else if ( this.swiftValue ) { %>
return <%=this.swiftValue%>
<% } else if ( this.swiftType.match(/[!?]$/) ) { %>
return nil
<% } else { %>
fatalError("No default value for <%=this.swiftName%>")
<% } %>
      */},
    },
    {
      name: 'swiftSlotSetter',
      args: [],
      template: function() {/*
self.<%=this.swiftSlotLinkSubName%>?.detach()
self.<%=this.swiftSlotLinkSubName%> = self.<%=this.swiftSlotName%>.linkFrom(value)
      */},
    },
    {
      name: 'swiftPropertyInfoInit',
      args: [],
      template: function() {/*
class PInfo: PropertyInfo {
  let name = "<%=this.swiftName%>"
  let classInfo: ClassInfo
  let transient = <%=!!this.transient%>
  let label = "<%=this.label%>" // TODO localize
  lazy private(set) public var jsonParser: Parser? = <%=this.swiftJsonParser%>
<% if (this.swiftView) { %>
  let view: FObject.Type? = <%=this.swiftView.split('.').pop()%>.self
<% } else { %>
  let view: FObject.Type? = nil
<% } %>
  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    <%=this.swiftCompareValues%>
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      */},
    }
  ],
});
