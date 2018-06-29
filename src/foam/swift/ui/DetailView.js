/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'DetailView',
  requires: [
    'foam.swift.ui.FOAMActionUIButton',
    'foam.swift.ui.PropertyView',
  ],
  swiftImports: [
    'UIKit',
  ],
  properties: [
    {
      name: 'view',
      swiftType: 'UIView',
      swiftFactory: 'return UIView()',
    },
    {
      class: 'String',
      name: 'title',
      swiftExpressionArgs: ['data'],
      swiftExpression: function() {/*
return data?.ownClassInfo().label ?? self.ownClassInfo().label
      */},
    },
    {
      name: 'propertyViews',
      swiftType: '[String:foam_core_FObject]',
      swiftFactory: 'return [:]',
    },
    {
      name: 'actionViews',
      swiftType: '[String:foam_swift_ui_FOAMActionUIButton]',
      swiftFactory: 'return [:]',
    },
    {
      name: 'subViewSubscriptions',
      swiftType: '[String:Subscription]',
      swiftFactory: 'return [:]',
    },
    {
      swiftType: 'ClassInfo?',
      name: 'of',
      swiftExpressionArgs: ['data'],
      swiftExpression: 'return data?.ownClassInfo() ?? nil',
    },
    {
      swiftType: 'foam_core_FObject?',
      name: 'data',
    },
    {
      class: 'Map',
      name: 'config',
    },
  ],
  methods: [
    {
      name: 'init',
      swiftCode: function() {/*
onDetach(of$.sub(listener: { (_, _) in
  self.reset()
}))
      */},
    },
    {
      name: 'reset',
      swiftCode: function() {/*
self.actionViews = [:]
self.propertyViews = [:]
for (_, sub) in subViewSubscriptions {
  sub.detach()
}
subViewSubscriptions = [:]
      */},
    },
    {
      name: 'initAllViews',
      swiftCode: function() {/*
var properties: [PropertyInfo] = []
var actions: [ActionInfo] = []
if let fobj = data as AnyObject as? foam_core_FObject {
  properties += fobj.ownClassInfo().axioms(byType: PropertyInfo.self)
  actions += fobj.ownClassInfo().axioms(byType: ActionInfo.self)
}
properties = properties.filter({ (p) -> Bool in
  return self[p.name] != nil
})
actions = actions.filter({ (a) -> Bool in
  return self[a.name] != nil
})

let viewNames = properties.map { (p) -> String in return p.name }

let labelViews = properties.map { (p) -> UILabel in
  let label = UILabel()
  label.text = p.label
  return label
}
labelViews.forEach { (v) in
  v.setContentHuggingPriority(.defaultHigh, for: .horizontal)
  v.setContentCompressionResistancePriority(.required, for: .horizontal)
}

let valueViews = properties.map { (p) -> UIView in
  return self[p.name]!.get(key: "view") as! UIView
}

let actionViews = actions.map { (a) -> UIView in
  return self[a.name]!.get(key: "view") as! UIView
}
actionViews.forEach { (v) in
  v.backgroundColor = .black
}

var viewMap: [String:UIView] = [:]
for (index, name) in viewNames.enumerated() {
  viewMap[name] = valueViews[index]
  viewMap[name + "Label"] = labelViews[index]
}
for (index, a) in actions.enumerated() {
  viewMap[a.name] = actionViews[index]
}

for v in viewMap.values {
  v.translatesAutoresizingMaskIntoConstraints = false
  view.addSubview(v)
}

for name in viewNames {
  view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|-["+name+"Label]-["+name+"]-|",
      options: .alignAllCenterY,
      metrics: nil,
      views: viewMap))
}

let vVisForm = "V:|-" + viewNames.map { (s) -> String in return "["+s+"Label]" }.joined(separator: "-")
view.addConstraints(NSLayoutConstraint.constraints(
    withVisualFormat: vVisForm,
    options: .alignAllRight,
    metrics: nil,
    views: viewMap))

if actions.count > 0 {
  view.addConstraints(NSLayoutConstraint.constraints(
    withVisualFormat: "H:|-"+actions.map({ (a) -> String in return "["+a.name+"]" }).joined(separator: "-"),
    options: .alignAllCenterY,
    metrics: nil,
    views: viewMap))
  if let anchor = labelViews.last {
    view.addConstraint(NSLayoutConstraint(
        item: actionViews[0],
        attribute: .top,
        relatedBy: .equal,
        toItem: anchor,
        attribute: .bottom,
        multiplier: 1,
        constant: 8))
  }
}

if let bottom: UIView = actionViews.first ?? labelViews.last {
  view.addConstraint(NSLayoutConstraint(
    item: view,
    attribute: .bottom,
    relatedBy: .equal,
    toItem: bottom,
    attribute: .bottom,
    multiplier: 1,
    constant: 0))
}
      */},
    },
    {
      name: 'getView',
      args: [
        {
          name: 'a',
          swiftType: 'PropertyInfo',
        }
      ],
      swiftReturns: 'foam_core_FObject?',
      swiftCode: function() {/*
if let c = config[a.name] as? [String:Any?],
    let vf = c["viewFactory"] as? (Context) -> foam_core_FObject? {
  return vf(__context__)
}
return a.viewFactory(x: __context__)
      */},
    },
  ],
  swiftCode: function() {/*
public subscript(key: String) -> foam_core_FObject? {
  guard let of = self.of else { return nil }
  if let v = self.propertyViews[key] ?? self.actionViews[key] {
    return v
  }
  if let a = of.axiom(byName: key) {
    if let a = a as? PropertyInfo, let viewFobj = getView(a) {
      let prop = a.name
      if let viewFobj = viewFobj as? foam_swift_ui_PropertyView {
        viewFobj.fromProperty(a)
      }
      propertyViews[prop] = viewFobj

      let sub = viewFobj.getSlot(key: "data")!.linkFrom(data$.dot(prop))
      subViewSubscriptions[prop] = sub
      self.onDetach(sub)

      return viewFobj
    } else if let a = a as? ActionInfo {
      let btn = FOAMActionUIButton_create()
      btn.fobj$ = data$
      btn.action = a
      actionViews[a.name] = btn
      return btn
    }
  }
  return nil
}
  */},
});
