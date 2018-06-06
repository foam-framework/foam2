/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
      class: 'Boolean',
      name: 'swiftRequiresEscaping',
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
      name: 'swiftGetter',
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
      name: 'swiftPrivateAxiomName',
      expression: function(swiftName) { return '_' + foam.String.constantize(swiftName) + '_'; },
    },
    {
      class: 'String',
      name: 'swiftAxiomName',
      expression: function(swiftName) { return foam.String.constantize(swiftName); },
    },
    {
      class: 'Boolean',
      name: 'swiftSupport',
      value: true,
    },
    {
      class: 'String',
      name: 'swiftJsonParser',
      value: 'Context.GLOBAL.create(AnyParser.self)!',
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
    function writeToSwiftClass(cls, superAxiom, parentCls) {
      if ( ! this.swiftSupport ) return;

      if ( foam.core.AbstractInterface.isSubClass(parentCls) ) {
        // TODO: Should we add vars to the protocol?
        return;
      }

      var isOverride = !!superAxiom;
      cls.fields.push(this.Field.create({
        visibility: 'public',
        override: isOverride,
        name: this.swiftName,
        type: this.swiftType,
        getter: this.swiftGetter || this.swiftGetterTemplate(),
        setter: this.swiftSetter(),
      }));
      cls.fields.push(this.Field.create({
        visibility: 'private',
        static: true,
        final: true,
        name: this.swiftPrivateAxiomName,
        type: 'PropertyInfo',
        initializer: this.swiftPropertyInfoInit(parentCls),
      }));
      cls.methods.push(this.Method.create({
        visibility: 'public',
        class: true,
        name: this.swiftAxiomName,
        returnType: 'PropertyInfo',
        body: 'return ' + this.swiftPrivateAxiomName,
        override: isOverride,
      }));
      if (this.swiftExpression) {
        cls.fields.push(this.Field.create({
          visibility: 'private',
          name: this.swiftExpressionSubscriptionName,
          type: '[Subscription]?',
        }));
      }
      if ( !isOverride ) {
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
            escaping: this.swiftRequiresEscaping,
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
            escaping: this.swiftRequiresEscaping,
            type: this.swiftType,
          },
        ],
      }));
    },
  ],
  templates: [
    {
      name: 'swiftSlotInitializer',
      template: function() {/*
let s = PropertySlot([
  "object": self,
  "propertyName": "<%=this.swiftName%>",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      */},
    },
    {
      name: 'swiftSetter',
      template: function() {/*
self.set(key: "<%=this.swiftName%>", value: value)
      */},
    },
    {
      name: 'swiftGetterTemplate',
      template: function() {/*
if <%=this.swiftInitedName%> {
  return <%=this.swiftValueName%><% if ( this.swiftType != this.swiftValueType ) { %>!<% } %>
}
<% if ( this.swiftFactory ) { %>
self.set(key: "<%=this.swiftName%>", value: <%=this.swiftFactoryName%>())
return <%=this.swiftValueName%><% if ( this.swiftRequiresCast ) { %>!<% } %>
<% } else if ( this.swiftExpression ) { %>
if <%= this.swiftExpressionSubscriptionName %> != nil { return <%= this.swiftValueName %> }
let valFunc = { [unowned self] () -> <%= this.swiftValueType %> in
  <% for (var i = 0, arg; arg = this.swiftExpressionArgs[i]; i++) { arg = arg.split('$') %>
  let <%=arg.join('$')%> = self.<%=arg[0]%><% if (arg.length > 1) {%>$<% arg.slice(1).forEach(function(a) { %>.dot("<%=a%>")<% }) %>.swiftGet()<% } %>
  <% } %>
  <%= this.swiftExpression %>
}
let detach: Listener = { [unowned self] _,_ in
  if self.<%=this.swiftExpressionSubscriptionName%> == nil { return }
  for s in self.<%=this.swiftExpressionSubscriptionName%>! {
    s.detach()
  }
  self.<%=this.swiftExpressionSubscriptionName%> = nil
  self.clearProperty("<%=this.swiftName%>")
}
<%=this.swiftExpressionSubscriptionName%> = [
  <% for (var i = 0, arg; arg = this.swiftExpressionArgs[i]; i++) { arg = arg.split('$') %>
  <%=arg[0]%>$<% arg.slice(1).forEach(function(a) { %>.dot("<%=a%>")<% }) %>.swiftSub(detach),
  <% } %>
]
<%=this.swiftExpressionSubscriptionName%>?.forEach({ s in
  onDetach(s)
})
<%=this.swiftValueName%> = valFunc()
return <%=this.swiftValueName%>
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
      template: function() {/*
self.<%=this.swiftSlotLinkSubName%>?.detach()
self.<%=this.swiftSlotLinkSubName%> = self.<%=this.swiftSlotName%>.linkFrom(value)
self.onDetach(self.<%=this.swiftSlotLinkSubName%>!)
      */},
    },
    {
      name: 'swiftPropertyInfoInit',
      args: ['parentCls'],
      template: function() {/*
class PInfo: PropertyInfo {
  let name = "<%=this.swiftName%>"
  let classInfo: ClassInfo
  let transient = <%=!!this.transient%>
  let label = "<%=this.label%>" // TODO localize
  let visibility = Visibility.<%=this.visibility.name%>
  lazy private(set) public var jsonParser: Parser? = <%=this.swiftJsonParser%>
  public func set(_ obj: FObject, value: Any?) {
    let obj = obj as! <%=parentCls.model_.swiftName%>
<% var p = this %>
<% if ( p.swiftExpression ) { %>
    if obj.<%= p.swiftExpressionSubscriptionName %> != nil {
      for s in obj.<%=p.swiftExpressionSubscriptionName%>! { s.detach() }
    }
<% } %>
    let oldValue: Any? = obj.<%=p.swiftInitedName%> ? obj.`<%=p.swiftName%>` : nil
    obj.<%=p.swiftValueName%> = obj.<%=p.swiftPreSetFuncName%>(oldValue, obj.<%=p.swiftAdaptFuncName%>(oldValue, value))
    obj.<%=p.swiftInitedName%> = true
    obj.<%=p.swiftPostSetFuncName%>(oldValue, obj.<%=p.swiftValueName%>)
    if obj.hasListeners(["propertyChange", "<%=p.swiftName%>"]) && !FOAM_utils.equals(oldValue, obj.<%=p.swiftValueName%>) {
      _ = obj.pub(["propertyChange", "<%=p.swiftName%>", obj.<%=p.swiftSlotName%>])
    }
  }
  public func get(_ obj: FObject) -> Any? {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.<%=this.swiftName%>
  }
  public func getSlot(_ obj: FObject) -> Slot {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.<%=this.swiftSlotName%>
  }
  public func setSlot(_ obj: FObject, value: Slot) {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    obj.<%=this.swiftSlotName%> = value
  }
  public func hasOwnProperty(_ obj: FObject) -> Bool {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.`<%=p.swiftInitedName%>`
  }
  public func clearProperty(_ obj: FObject) {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    obj.<%= p.swiftInitedName %> = false
    obj.<%= p.swiftValueName %> = nil

<% if ( p.swiftExpression ) { %>
    if obj.<%= p.swiftExpressionSubscriptionName %> != nil {
      for s in obj.<%=p.swiftExpressionSubscriptionName%>! { s.detach() }
    }
    obj.<%= p.swiftExpressionSubscriptionName %> = nil
<% } %>

    // Only pub if there are listeners.
    if obj.hasListeners(["propertyChange", "<%=p.swiftName%>"]) {
      _ = obj.pub(["propertyChange", "<%=p.swiftName%>", obj.<%=p.swiftSlotName%>])
    }
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    <%=this.swiftCompareValues%>
  }
  init(_ ci: ClassInfo) { classInfo = ci }
  func viewFactory(x: Context) -> FObject? {
<% if (this.swiftView && !this.hidden) { %>
    return x.lookup("<%=this.swiftView%>")?.create(x: x) as? FObject
<% } else { %>
    return nil
<% } %>
  }
}
return PInfo(classInfo())
      */},
    }
  ],
});

foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'swiftType',
      expression: function(of, required) {
        of = of ? of.model_.swiftName : 'FObject';
        return of + (required ? '' : '?');
      },
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Class',
  properties: [
    {
      name: 'swiftType',
      value: 'ClassInfo',
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.List',
  properties: [
    {
      name: 'swiftType',
      value: '[Any?]',
    },
    {
      name: 'swiftFactory',
      value: 'return []',
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [
    {
      name: 'swiftType',
      value: 'Bool',
    },
    {
      name: 'swiftValue',
      expression: function(value) {
        return '' + value;
      },
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Map',
  properties: [
    {
      name: 'swiftType',
      value: '[String:Any?]',
    },
    {
      name: 'swiftValue',
      value: '[:]',
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.StringArray',
  properties: [
    {
      name: 'swiftType',
      value: '[String]',
    },
    {
      name: 'swiftValue',
      value: '[]',
    },
  ],
});

foam.CLASS({
  name: 'GenIBOutletDetailViewModel',
  package: 'foam.swift.ui',
  extends: 'foam.core.Model',
  properties: [
    [ 'extends', 'foam.swift.ui.AbstractGenIBOutletDetailView' ],
    {
      class: 'StringArray',
      name: 'classes',
    },
    {
      class: 'String',
      name: 'viewType',
      value: 'UIView',
    },
  ],
});

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'AbstractGenIBOutletDetailView',

  axioms: [
    {
      installInClass: function(cls) {
        cls.toSwiftClass =  function() {
          var cls = foam.swift.SwiftClass.create({
            visibility: 'public',
            name: this.name,
            implements: [this.model_.viewType],
            imports: ['UIKit'],
          });

          this.model_.classes.map(function(c) { return foam.lookup(c) }).forEach(function(c) {
            var dvName = 'dv_' + c.model_.swiftName;

            var didSets = [];
            var addViewAxioms = function(a) {
              var pName = c.model_.swiftName + '_' + a.name;
              var didSet = `if ${pName} != nil { self.${dvName}?["${a.name}"]?.set(key: "view", value: self.${pName}) }`;
              cls.fields.push(foam.swift.Field.create({
                visibility: 'public',
                annotations: ['@IBOutlet'],
                type: 'UIView?',
                name: pName,
                didSet: didSet,
              }))
              didSets.push(didSet);
            };
            c.getAxiomsByClass(foam.core.Property).forEach(addViewAxioms);
            c.getAxiomsByClass(foam.core.Action).forEach(addViewAxioms);
            cls.fields.push(foam.swift.Field.create({
              visibility: 'public',
              name: dvName,
              weak: true,
              type: 'DetailView?',
              didSet: didSets.join('\n') + `\n${dvName}?.view = self`,
            }));
          })
          return cls;
        }
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.DateTime',
  properties: [
    {
      name: 'swiftType',
      expression: function(required) {
        return 'Date' + (required ? '' : '?')
      },
    },
    {
      name: 'swiftAdapt',
      value: `
if let n = newValue as? Date {
  return n
} else if let n = newValue as? String {
  let dateFormatter = DateFormatter()
  dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.S'Z'"
  return dateFormatter.date(from: n)
} else if let n = newValue as? NSNumber {
  return Date(timeIntervalSince1970: n.doubleValue)
}

return Date()
      `,
    },
  ],
})

foam.CLASS({
  refines: 'foam.core.Enum',
  properties: [
    {
      name: 'swiftType',
      expression: function(of, required) {
        return (of ? of.model_.swiftName : 'FOAM_enum') + (required ? '' : '?');
      },
    },
    {
      name: 'swiftAdapt',
      expression: function(of, swiftType) {
        var name = of && of.model_.swiftName
        if (!name) return `return newValue as! ${swiftType}`;
        return `
if let n = newValue as? Int {
  return ${name}.fromOrdinal(n)
}
return newValue as! ${swiftType}
        `;
      },
    },
  ],
});
