/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Property',
  flags: ['swift'],
  requires: [
    'foam.swift.Argument',
    'foam.swift.Field',
    'foam.swift.Method',
    'foam.swift.ProtocolField',
    'foam.swift.SwiftClass',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftVarName',
      expression: function(name) {
        var reserved = [
          'description',
        ];
        if ( reserved.indexOf(name) != -1 ) {
          return 'swift_' + name;
        }
        return name;
      },
    },
    {
      class: 'String',
      name: 'swiftView',
    },
    {
      class: 'String',
      name: 'swiftSlotLinkSubName',
      expression: function(name) { return name + '_Value_Sub_'; },
    },
    {
      class: 'String',
      name: 'swiftSlotValueName',
      expression: function(name) { return name + '_Value_'; },
    },
    {
      class: 'String',
      name: 'swiftSlotName',
      expression: function(name) { return name + '$'; },
    },
    {
      class: 'String',
      name: 'swiftInitedName',
      expression: function(name) { return '_' + name + '_inited_'; },
    },
    {
      class: 'String',
      name: 'swiftValueName',
      expression: function(name) { return '_' + name + '_'; },
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
      expression: function(name) { return '_' + name + '_factory_'; },
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
      name: 'swiftSetter',
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
      expression: function(name) { return '_' + name + '_preSet_'; },
    },
    {
      class: 'String',
      name: 'swiftPostSet',
    },
    {
      class: 'String',
      name: 'swiftPostSetFuncName',
      expression: function(name) { return '_' + name + '_postSet_'; },
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
      expression: function(name) { return '_' + name + '_expression_'; },
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
      expression: function(name) { return '_' + name + '_adapt_'; },
    },
    {
      class: 'String',
      name: 'swiftPrivateAxiomName',
      expression: function(name) { return '_' + foam.String.constantize(name) + '_'; },
    },
    {
      class: 'String',
      name: 'swiftAxiomName',
      expression: function(name) { return foam.String.constantize(name); },
    },
    {
      class: 'String',
      name: 'swiftToJSON',
      value: 'outputter.output(out, value)',
    },
    {
      class: 'Boolean',
      name: 'swiftSupport',
      value: true,
    },
    {
      class: 'String',
      name: 'swiftJsonParser',
      factory: function() {
        return `Context.GLOBAL.create(${foam.swift.parse.json.AnyParser.model_.swiftName}.self)!`;
      },
    },
    {
      class: 'Boolean',
      name: 'swiftWeak',
      value: false,
    },
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      if ( ! this.swiftSupport ) return;

      if ( foam.core.AbstractInterface.isSubClass(parentCls) ) {
        cls.field(this.ProtocolField.create({
          name: this.swiftVarName,
          type: this.swiftType,
          // TODO: Make these configurable?
          get: true,
          set: true,
        }));
        return;
      }

      // We don't use getSuperAxiomByName here because that will pull in axioms
      // from implements and those aren't overrides in swift.
      var isOverride = !!parentCls.getSuperClass().getAxiomByName(this.name);
      cls.fields.push(this.Field.create({
        visibility: 'public',
        override: isOverride,
        name: this.swiftVarName,
        type: this.swiftType,
        getter: this.swiftGetter || this.swiftGetterTemplate(),
        setter: this.swiftSetter || this.swiftSetterTemplate(),
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
          type: foam.swift.core.PropertySlot.model_.swiftName,
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
          type: foam.swift.core.Slot.model_.swiftName,
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
let s = <%=foam.swift.core.PropertySlot.model_.swiftName%>([
  "object": self,
  "propertyName": "<%=this.name%>",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      */},
    },
    {
      name: 'swiftSetterTemplate',
      template: function() {/*
self.set(key: "<%=this.name%>", value: value)
      */},
    },
    {
      name: 'swiftGetterTemplate',
      template: function() {/*
if <%=this.swiftInitedName%> {
  return <%=this.swiftValueName%><% if ( this.swiftType != this.swiftValueType ) { %>!<% } %>
}
<% if ( this.swiftFactory ) { %>
self.set(key: "<%=this.name%>", value: <%=this.swiftFactoryName%>())
return <%=this.swiftValueName%><% if ( this.swiftRequiresCast ) { %>!<% } %>
<% } else if ( this.swiftExpression ) { %>
if <%= this.swiftExpressionSubscriptionName %> != nil { return <%= this.swiftValueName %> }
let valFunc = { [unowned self] () -> <%= this.swiftType %> in
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
  self.clearProperty("<%=this.name%>")
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
fatalError("No default value for <%=this.name%>")
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
  let name = "<%=this.name%>"
  let classInfo: ClassInfo
  let transient = <%=!!this.transient%>
  let storageTransient = <%=!!this.storageTransient%>
  let networkTransient = <%=!!this.networkTransient%>
  let label = "<%=this.label%>" // TODO localize
  lazy private(set) var visibility: <%=foam.u2.Visibility.model_.swiftName%> = {
    return <%=foam.u2.Visibility.model_.swiftName%>.<%=this.visibility.name%>
  }()
  lazy private(set) public var jsonParser: <%=foam.swift.parse.parser.Parser.model_.swiftName%>? = <%=this.swiftJsonParser%>
  public func set(_ obj: foam_core_FObject, value: Any?) {
    let obj = obj as! <%=parentCls.model_.swiftName%>
<% var p = this %>
<% if ( p.swiftSetter ) { %>
    obj.<%=this.swiftVarName%> = value<%if (this.swiftType != 'Any?') {%> as! <%=this.swiftType%><%}%>
<% } else { %>
  <% if ( p.swiftExpression ) { %>
    if obj.<%= p.swiftExpressionSubscriptionName %> != nil {
      for s in obj.<%=p.swiftExpressionSubscriptionName%>! { s.detach() }
    }
  <% } %>
    let oldValue: Any? = obj.<%=p.swiftInitedName%> ? obj.`<%=p.name%>` : nil
    obj.<%=p.swiftValueName%> = obj.<%=p.swiftPreSetFuncName%>(oldValue, obj.<%=p.swiftAdaptFuncName%>(oldValue, value))
    obj.<%=p.swiftInitedName%> = true
    obj.<%=p.swiftPostSetFuncName%>(oldValue, obj.<%=p.swiftValueName%>)
    if obj.hasListeners(["propertyChange", "<%=p.name%>"]) && !FOAM_utils.equals(oldValue, obj.<%=p.swiftValueName%>) {
      _ = obj.pub(["propertyChange", "<%=p.name%>", obj.<%=p.swiftSlotName%>])
    }
<% } %>
  }
  public func get(_ obj: foam_core_FObject) -> Any? {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.<%=this.swiftVarName%>
  }
  public func getSlot(_ obj: foam_core_FObject) -> <%=foam.swift.core.Slot.model_.swiftName%> {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.<%=this.swiftSlotName%>
  }
  public func setSlot(_ obj: foam_core_FObject, value: <%=foam.swift.core.Slot.model_.swiftName%>) {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    obj.<%=this.swiftSlotName%> = value
  }
  public func hasOwnProperty(_ obj: foam_core_FObject) -> Bool {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.`<%=p.swiftInitedName%>`
  }
  public func clearProperty(_ obj: foam_core_FObject) {
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
    if obj.hasListeners(["propertyChange", "<%=p.name%>"]) {
      _ = obj.pub(["propertyChange", "<%=p.name%>", obj.<%=p.swiftSlotName%>])
    }
  }
  init(_ ci: ClassInfo) { classInfo = ci }
  func viewFactory(x: Context) -> foam_core_FObject? {
<% if (this.swiftView && !this.hidden) { %>
    return x.lookup("<%=this.swiftView%>")?.create(x: x) as? foam_core_FObject
<% } else { %>
    return nil
<% } %>
  }
  public func toJSON(outputter: <%=foam.swift.parse.json.output.Outputter.model_.swiftName%>, out: foam_json2_Outputter, value: Any?) {
    <%=p.swiftToJSON%>
  }
}
return PInfo(classInfo())
      */},
    }
  ],
});

foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      expression: function(of, required) {
        of = of ? of.model_.swiftName : 'foam_core_FObject';
        return of + (required ? '' : '?');
      },
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Class',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      value: 'ClassInfo',
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.List',
  flags: ['swift'],
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
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      value: 'Bool',
    },
    {
      name: 'swiftValue',
      expression: function(value) { return foam.swift.stringify(value) },
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Map',
  flags: ['swift'],
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
  flags: ['swift'],
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
            name: this.model_.swiftName,
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
              type: 'foam_swift_ui_DetailView?',
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
  flags: ['swift'],
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
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      expression: function(of, required) {
        return (of ? of.model_.swiftName : 'AbstractEnum') + (required ? '' : '?');
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

foam.CLASS({
  refines: 'foam.core.MultiPartID',
  flags: [ 'swift' ],
  properties: [
    {
      name: 'swiftGetter',
      expression: function(propNames) {
        return `
let propNames = ${foam.swift.stringify(propNames)}
var args = [String:Any?]()
for propName in propNames {
  let pInfo = self.ownClassInfo().axiom(byName: propName) as! PropertyInfo
  args[propName] = pInfo.get(self)
}
return self.__subContext__.create(${this.of.model_.swiftName}.self, args: args)!
        `
      },
    },
    {
      name: 'swiftSetter',
      expression: function(propNames) {
        return `
let propNames = ${foam.swift.stringify(propNames)}
for propName in propNames {
  let selfPInfo = self.ownClassInfo().axiom(byName: propName) as! PropertyInfo
  let valuePInfo = value!.ownClassInfo().axiom(byName: propName) as! PropertyInfo
  selfPInfo.set(self, value: valuePInfo.get(value!))
}
        `
      },
    },
  ],
})

foam.CLASS({
  refines: 'foam.core.IDAlias',
  flags: [ 'swift' ],
  properties: [
    {
      name: 'swiftGetter',
      expression: function(targetProperty) {
        return `
return Swift.type(of: self).${targetProperty.swiftAxiomName}().get(self)
        `
      },
    },
    {
      name: 'swiftSetter',
      expression: function(targetProperty) {
        return `
return Swift.type(of: self).${targetProperty.swiftAxiomName}().set(self, value: value)
        `
      },
    },
  ],
})

foam.CLASS({
  refines: 'foam.core.Reference',
  flags: [ 'swift' ],
  requires: [
    'foam.swift.ProtocolMethod',
  ],
  properties: [
    {
      // TODO: copied from java refinements.
      name: 'referencedProperty',
      transient: true,
      factory: function() {
        var idProp = this.of.ID.cls_ == foam.core.IDAlias ? this.of.ID.targetProperty : this.of.ID;

        idProp = idProp.clone();
        idProp.name = this.name;

        return idProp;
      }
    },
    {
      name: 'swiftType',
      factory: function() { return this.referencedProperty.swiftType; }
    },
    {
      name: 'swiftJsonParser',
      factory: function() { return this.referencedProperty.swiftJsonParser; }
    },
  ],

  methods: [
    function writeToSwiftClass(cls, parentCls) {
      this.SUPER(cls, parentCls);
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      if ( ! this.swiftSupport ) return;
      cls.method({
        visibility: 'public',
        override: !!parentCls.getSuperClass().getAxiomByName(this.name),
        name: `find${foam.String.capitalize(this.name)}`,
        returnType: this.of.model_.swiftName,
        args: [
          {
            localName: 'x',
            externalName: '_',
            type: 'Context'
          }
        ],
        throws: true,
        body: `
let dao = x["${this.targetDAOKey}"] as! foam_dao_DAO
return try dao.find_(x, ${this.swiftVarName}) as! ${this.of.model_.swiftName}
        `
      });
    }
  ]
});
