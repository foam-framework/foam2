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
  refines: 'foam.core.AbstractMethod',
  requires: [
    'foam.core.Argument',
    'foam.swift.Argument as SwiftArgument',
    'foam.swift.Field',
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name == 'init' ? '__foamInit__' : name; },
    },
    {
      class: 'String',
      name: 'swiftAxiomName',
      expression: function(swiftName) { return foam.String.constantize(swiftName) },
    },
    {
      class: 'String',
      name: 'swiftSlotName',
      expression: function(swiftName) { return swiftName + '$'; },
    },
    {
      class: 'Boolean',
      name: 'swiftThrows',
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Argument',
      name: 'args',
      adaptArrayElement: function(o, prop) {
        var Argument = foam.lookup('foam.core.Argument');
        return typeof o === 'string' ? Argument.create({name: o}) :
            Argument.create(o);
      },
    },
    {
      name: 'swiftArgs',
      expression: function(args) {
        var swiftArgs = [];
        args.forEach(function(a) {
          swiftArgs.push(this.Argument.create(a).toSwiftArg());
        }.bind(this));
        return swiftArgs;
      },
      adapt: function(_, n) {
        var self = this;
        var adaptElement = function(o) {
          if ( o.class ) {
            var m = foam.lookup(o.class);
            if ( ! m ) throw 'Unknown class : ' + o.class;
            return m.create(o, self);
          }
          return self.SwiftArgument.isInstance(o) ? o : self.SwiftArgument.create(o);
        }
        return n.map(adaptElement);
      },
    },
    {
      class: 'String',
      name: 'swiftVisibility',
      value: 'public',
    },
    {
      class: 'String',
      name: 'swiftCode',
      expression: function(parentCls, name) {
        if (foam.core.internal.InterfaceMethod.isInstance(
            parentCls.getSuperAxiomByName(name))) {
          return 'fatalError()';
        }
        return '';
      },
    },
    {
      class: 'Boolean',
      name: 'swiftOverride',
      expression: function(parentCls, name) {
        var parentMethod = parentCls.getSuperAxiomByName(name);
        return name == 'init' ||
          !!( parentMethod &&
              parentMethod.swiftSupport &&
              !foam.core.internal.InterfaceMethod.isInstance(parentMethod))
      },
    },
    {
      class: 'String',
      name: 'swiftSupport',
      expression: function(swiftCode) { return !!swiftCode }
    },
    {
      class: 'String',
      name: 'swiftReturns',
      expression: function(returns) {
        if (!returns) return '';
        var cls = foam.lookup(returns, true)
        if (cls) {
          return cls.model_.swiftName
        }
        return 'Any?';
      },
    },
    {
      class: 'StringArray',
      name: 'swiftAnnotations',
    },
  ],
  methods: [
    function writeToSwiftClass(cls, superAxiom) {
      if (!this.swiftSupport) return;
      if ( !this.swiftOverride ) {
        cls.fields.push(this.Field.create({
          lazy: true,
          name: this.swiftSlotName,
          initializer: this.slotInit(),
          type: 'Slot',
        }));
      }
      cls.fields.push(this.Field.create({
        visibility: 'private',
        static: true,
        final: true,
        name: this.swiftAxiomName,
        type: 'MethodInfo',
        initializer: this.swiftMethodInfoInit(),
      }));
      cls.method(this.Method.create({
        name: this.swiftName,
        body: this.swiftCode,
        throws: this.swiftThrows,
        returnType: this.swiftReturns,
        args: this.swiftArgs,
        visibility: this.swiftVisibility,
        override: this.swiftOverride,
        annotations: this.swiftAnnotations,
      }));
    },
  ],
  templates: [
    {
      name: 'slotInit',
      args: [],
      template: function() {/*
<%
var isMutable = function(a) { return a.annotations.indexOf('inout') != -1 };
%>
return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }
<% this.swiftArgs.forEach(function(a, i) { %>
    <%=isMutable(a) ? 'var' : 'let' %> <%
  %><%=a.localName%> = args[<%=i%>]<%if(a.type!='Any?'){%> as! <%=a.type%><%}%>
<% }) %>
    
    return <%=this.swiftThrows ? 'try ' : ''%>self!.`<%=this.swiftName%>`(
        <%=this.swiftArgs.map(function(a){
          return (a.externalName ? a.externalName + ': ' : '') +
                 (isMutable(a) ? '&' : '') +
                 a.localName
        }).join(', ')%>)
  }
])
      */},
    },
    {
      name: 'swiftMethodInfoInit',
      args: [],
      template: function() {/*
class MInfo: MethodInfo {
  let name = "<%=this.swiftName%>"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      */},
    }
  ],
});
