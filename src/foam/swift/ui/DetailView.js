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
  package: 'foam.swift.ui',
  name: 'DetailView',
  requires: [
    'foam.swift.ui.FOAMActionUIButton',
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
      name: 'propertyLabelViews',
      swiftType: '[String:UILabel]',
      swiftFactory: 'return [:]',
    },
    {
      name: 'propertyViews',
      swiftType: '[String:FObject]',
      swiftFactory: 'return [:]',
    },
    {
      name: 'actionViews',
      swiftType: '[String:FOAMActionUIButton]',
      swiftFactory: 'return [:]',
    },
    {
      name: 'subViewSubscriptions',
      swiftType: '[String:Subscription]',
      swiftFactory: 'return [:]',
    },
    {
      swiftType: 'FObject?',
      name: 'data',
      swiftPostSet: 'self.reset()',
    },
  ],
  methods: [
    {
      name: 'reset',
      swiftCode: function() {/*
self.actionViews = [:]
self.propertyViews = [:]
self.propertyLabelViews = [:]
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
var actions: [Action] = []
if let fobj = data as AnyObject as? FObject {
  properties += type(of: fobj).classInfo().axioms(byType: PropertyInfo.self)
  actions += type(of: fobj).classInfo().axioms(byType: Action.self)
}

var vstack: [UIView] = []
for p in properties {
  guard let dv = self[p.name] else { continue }
  let hstack = UIStackView(arrangedSubviews: [
    propertyLabelViews[p.name]!,
    dv.get(key: "view") as! UIView
  ])
  hstack.axis = .horizontal
  hstack.spacing = 10
  vstack.append(hstack)
}

var actionButtons: [UIView] = []
for a in actions {
  guard let view = self[a.name] as? FOAMActionUIButton else { continue }
  view.view.backgroundColor = UIColor.black
  actionButtons.append(view.view)
}
let actionStack = UIStackView(arrangedSubviews: actionButtons)
actionStack.axis = .horizontal
actionStack.spacing = 10
vstack.append(actionStack)

let stackView = UIStackView(arrangedSubviews: vstack)
stackView.axis = .vertical
stackView.distribution = .equalSpacing
stackView.alignment = .leading

let views: [String:UIView] = ["v": stackView]
for (_, v) in views {
  v.translatesAutoresizingMaskIntoConstraints = false
  view.addSubview(v)
}
view.addConstraints(NSLayoutConstraint.constraints(
  withVisualFormat: "V:|-[v]-|",
  options: NSLayoutFormatOptions.init(rawValue: 0),
  metrics: nil,
  views: views))
view.addConstraints(NSLayoutConstraint.constraints(
  withVisualFormat: "H:|-[v]-|",
  options: NSLayoutFormatOptions.init(rawValue: 0),
  metrics: nil,
  views: views))
      */},
    },
  ],
  swiftCode: function() {/*
subscript(key: String) -> FObject? {
  guard let data = self.data as AnyObject as? FObject else { return nil }
  if let v = self.propertyViews[key] ?? self.actionViews[key] {
    return v
  }
  let classInfo = type(of: data).classInfo()
  if let a = classInfo.axiom(byName: key) {
    if let a = a as? PropertyInfo, a.view != nil {
      let prop = a.name
      let viewFobj = self.__subContext__.create(type: a.view!) as! FObject
      propertyViews[prop] = viewFobj

      let label = UILabel()
      label.text = a.label
      propertyLabelViews[prop] = label

      subViewSubscriptions[prop] =
          viewFobj.getSlot(key: "data")!.linkFrom(data.getSlot(key: prop)!)
      return viewFobj
    } else if let a = a as? Action {
      let btn = FOAMActionUIButton_create()
      btn.fobj = data
      btn.action = a
      actionViews[a.name] = btn
      return btn
    }
  }
  return nil
}
  */},
});
