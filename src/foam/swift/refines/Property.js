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
      expression: function(value) {
        return foam.typeOf(value) === foam.String ? '"' + value + '"' :
          foam.typeOf(value) === foam.Undefined ? 'nil' :
          value;
      }
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
      name: 'swiftAdapt',
      expression: function(swiftType) {
        if (swiftType == 'Any?') return 'return newValue';
        return 'return newValue as! ' + swiftType;
      },
    },
    {
      class: 'String',
      name: 'swiftAdaptFuncName',
      expression: function(swiftName) { return '_' + swiftName + '_adapt_'; },
    },
  ],
  methods: [
    function isOverride() {
      return !!foam.lookup(this.sourceCls_.model_.extends)
          .getAxiomByName(this.name);
    },
    function writeToSwiftClass(cls) {
      cls.fields.push(this.Field.create({
        visibility: 'private',
        name: this.swiftValueName,
        type: 'Any?',
        defaultValue: 'nil',
      }));
      cls.fields.push(this.Field.create({
        visibility: 'private',
        name: this.swiftInitedName,
        type: 'Bool',
        defaultValue: 'false',
      }));
      cls.fields.push(this.Field.create({
        visibility: 'public',
        override: this.isOverride(),
        name: this.swiftName,
        type: this.swiftType,
        getter: this.swiftGetter(),
        setter: 'self.set(key: "'+this.swiftName+'", value: value)',
      }));
      if ( !this.isOverride() ) {
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
          type: 'PropertySlot',
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
return PropertySlot(object: self, propertyName: "<%=this.swiftName%>")
      */},
    },
    {
      name: 'swiftGetter',
      args: [],
      template: function() {/*
if <%=this.swiftInitedName%> {
  return <%=this.swiftValueName%><% if ( this.swiftType != 'Any?' ) { %> as! <%=this.swiftType %><% } %>
}
<% if ( this.swiftFactory ) { %>
let factoryValue = <%=this.swiftFactoryName%>()
<%=this.swiftValueName%> = factoryValue
return factoryValue
<% } else if ( this.swiftValue ) { %>
return <%=this.swiftValue%>
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
    }
  ],
});
