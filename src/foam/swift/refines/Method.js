/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  flags: ['swift'],
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
      name: 'swiftPrivateAxiomName',
      expression: function(swiftName) { return '_' + foam.String.constantize(swiftName) + '_'; },
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
      name: 'swiftSynchronized',
    },
    {
      class: 'String',
      name: 'swiftSynchronizedSemaphoreName',
      expression: function(swiftName) { return swiftName + '_semaphore_' },
    },
    {
      class: 'String',
      name: 'swiftSynchronizedMethodName',
      expression: function(swiftName) { return swiftName + '_synchronized_' },
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
       return args.map(function(a) {
          if ( ! a.toSwiftArg ) debugger;
          return this.Argument.create(a).toSwiftArg()
        }.bind(this));
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
    },
    {
      class: 'Boolean',
      name: 'swiftOverride',
    },
    {
      class: 'String',
      name: 'swiftSupport',
    },
    {
      class: 'Boolean',
      name: 'swiftReturnsOptional',
    },
    {
      class: 'String',
      name: 'swiftReturns',
      expression: function(returns, swiftReturnsOptional) {
        if (!returns) return '';
        var cls = foam.lookup(returns, true)
        if (cls) {
          return cls.model_.swiftName + (swiftReturnsOptional ? '?' : '')
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
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      this.writeToSwiftClass_(cls, parentCls);
    },
    function writeToSwiftClass_(cls, parentCls) {
      if ( ! this.getSwiftSupport(parentCls) ) return;
      if ( ! this.getSwiftOverride(parentCls) ) {
        cls.fields.push(this.Field.create({
          lazy: true,
          name: this.swiftSlotName,
          initializer: this.slotInit(),
          type: foam.swift.core.Slot.model_.swiftName,
        }));
      }
      cls.fields.push(this.Field.create({
        visibility: 'private',
        static: true,
        final: true,
        name: this.swiftPrivateAxiomName,
        type: 'MethodInfo',
        initializer: this.swiftMethodInfoInit(parentCls),
      }));
      if (this.name != 'init') {
        cls.methods.push(this.Method.create({
          visibility: 'public',
          class: true,
          name: this.swiftAxiomName,
          returnType: 'MethodInfo',
          body: 'return ' + this.swiftPrivateAxiomName,
          override: this.getSwiftOverride(parentCls),
        }));
      }
      var code = this.getSwiftCode(parentCls);
      if ( this.swiftSynchronized ) {
        var sem = this.swiftSynchronizedSemaphoreName
        cls.fields.push(this.Field.create({
          visibility: 'private',
          final: true,
          name: sem,
          type: 'DispatchSemaphore',
          defaultValue: 'DispatchSemaphore(value: 1)',
        }));
        cls.method(this.Method.create({
          name: this.swiftSynchronizedMethodName,
          body: this.getSwiftCode(parentCls),
          throws: this.swiftThrows,
          returnType: this.swiftReturns,
          args: this.swiftArgs,
          visibility: this.swiftVisibility,
          override: this.getSwiftOverride(parentCls),
          annotations: this.swiftAnnotations,
        }));
        cls.method(this.Method.create({
          name: this.swiftName,
          body: this.syncronizedCode(),
          throws: this.swiftThrows,
          returnType: this.swiftReturns,
          args: this.swiftArgs,
          visibility: this.swiftVisibility,
          override: this.getSwiftOverride(parentCls),
          annotations: this.swiftAnnotations,
        }));
      } else {
        cls.method(this.Method.create({
          name: this.swiftName,
          body: this.getSwiftCode(parentCls),
          throws: this.swiftThrows,
          returnType: this.swiftReturns,
          args: this.swiftArgs,
          visibility: this.swiftVisibility,
          override: this.getSwiftOverride(parentCls),
          annotations: this.swiftAnnotations,
        }));
      }
    },
    function getSwiftCode(parentCls) {
      if (this.swiftCode) return this.swiftCode;
      if (foam.core.internal.InterfaceMethod.isInstance(
          parentCls.getSuperAxiomByName(this.name))) {
        return 'fatalError()';
      }
      return '';
    },
    function getSwiftSupport(parentCls) {
      if (this.hasOwnProperty('swiftSupport')) return this.swiftSupport;
      return !!this.getSwiftCode(parentCls);
    },
    function getSwiftOverride(parentCls) {
      if (this.hasOwnProperty('swiftOverride')) return this.swiftOverride;
      if (this.name == 'init') return true;

      var parentMethod = parentCls.getSuperAxiomByName(this.name);
      if (!parentMethod) return false;

      var InterfaceMethod = foam.core.internal.InterfaceMethod;

      if (InterfaceMethod.isInstance(parentMethod)) {
        // Find the interface that the method belongs to and determine if a
        // parent implements this interface.
        var methodInterface = parentCls.getAxiomsByClass(foam.core.Implements).find(function(i) {
          return foam.lookup(i.path).getAxiomsByClass(InterfaceMethod).find(function(m) {
            return m === parentMethod;
          })
        });
        return ! methodInterface ||
            !! parentCls.getSuperClass().getAxiomByName(methodInterface.name);
      }

      // Determine if anything that's extended implements this interface.
      var pCl = parentCls
      while (true) {
        pCl = pCl.getSuperClass();
        // Stop when we reach 'FObject' since we generate our own FObject.
        if (pCl === pCl.getSuperClass()) return false;
        if (pCl.hasOwnAxiom(this.name)) return true;
      }
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
return <%=foam.swift.core.ConstantSlot.model_.swiftName%>([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }
<% this.swiftArgs.forEach(function(a, i) { %>
    <%=isMutable(a) ? 'var' : 'let' %> <%
  %><%=a.localName%> = args[<%=i%>] as<%=!a.type.match(/^Any\??$/) ? '!' : ''%> <%=a.type%>
<% }) %>

    return <%=this.swiftThrows ? 'try ' : ''%>self!.`<%=this.swiftName%>`(
        <%=this.swiftArgs.map(function(a){
          return (a.externalName != '_' ? a.externalName + ': ' : '') +
                 (isMutable(a) ? '&' : '') +
                 a.localName
        }).join(', ')%>)
  }
])
      */},
    },
    {
      name: 'syncronizedCode',
      args: [],
      template: function() {/*
<%=this.swiftSynchronizedSemaphoreName%>.wait()
<%if (this.swiftReturns) {%>let ret = <%}%><%=
    this.swiftSynchronizedMethodName%>(<%=
        this.swiftArgs.map(function(a) { return a.localName }).join(',')%>)
<%=this.swiftSynchronizedSemaphoreName%>.signal()
<%if (this.swiftReturns) {%>return ret<%}%>
      */},
    },
    {
      name: 'swiftMethodInfoInit',
      args: ['parentCls'],
      template: function() {/*
class MInfo: MethodInfo {
  let name = "<%=this.swiftName%>"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
  public func getSlot(_ obj: <%=foam.core.FObject.model_.swiftName%>) -> <%=foam.swift.core.Slot.model_.swiftName%> {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.<%=this.swiftSlotName%>
  }
}
return MInfo(classInfo())
      */},
    }
  ],
});

foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  package: 'foam.swift.refines',
  name: 'CreateChildRefines',
  flags: ['swift'],
  methods: [
    function createChildMethod_(child) {
      var result = child.clone();
      var props = child.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < props.length ; i++ ) {
        var prop = props[i];
        if ( this.hasOwnProperty(prop.name) && ! child.hasOwnProperty(prop.name) ) {
          prop.set(result, prop.get(this));
        }
      }

      // Special merging behaviour for args.
      var i = 0;
      var resultArgs = [];
      for ( ; i < this.args.length ; i++ ) resultArgs.push(this.args[i].clone().copyFrom(child.args[i]));
      for ( ; i < child.args.length ; i++ ) resultArgs.push(child.args[i]);
      result.args = resultArgs; // To trigger the adaptArrayElement

      return result;
    },
  ]
});
