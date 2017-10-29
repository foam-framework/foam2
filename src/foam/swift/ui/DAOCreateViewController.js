/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'DAOCreateViewController',
  extends: 'foam.swift.ui.ScrollingViewController',
  requires: [
    'foam.swift.ui.DetailView',
  ],
  swiftImports: [
    'UIKit',
  ],
  imports: [
    'stack',
  ],
  properties: [
    {
      swiftType: '(FObject & DAO)',
      name: 'dao',
    },
    {
      swiftType: 'FObject',
      name: 'data',
      swiftExpressionArgs: ['dao$of'],
      swiftExpression: function() {/*
guard let of = dao$of as? ClassInfo else {
  fatalError("no dao of over here!")
}
return of.create(x: self.__context__) as! FObject
      */},
    },
    {
      name: 'view',
      swiftFactory: function() {/*
let dv = DetailView_create(["data$": data$])
dv.initAllViews()
return dv
      */},
    },
  ],
  methods: [
    {
      name: 'init',
      swiftCode: function() {/*
super.__foamInit__()
let onVcChange = { [weak self] () -> Void in
  guard let vc = self?.vc else {
    NSLog("No VC")
    return
  }
  vc.navigationItem.rightBarButtonItem = UIBarButtonItem(
      title: "Save",
      style: .plain,
      target: self,
      action: #selector(DAOCreateViewController.onSaveButtonPressed))
}
self.onDetach(self.vc$.sub(listener: { (_, _) in
  onVcChange()
}))
onVcChange()
      */},
    },
    {
      name: 'onSaveButtonPressed',
      swiftAnnotations: ['@objc'],
      swiftCode: function() {/*
(view?.get(key: "view") as? UIView)?.endEditing(true)
_ = try! dao.put(data)
(stack as? UINavigationController)?.popViewController(animated: true)
      */},
    },
  ],
});
