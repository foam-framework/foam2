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
  messages: [
    {
      name: 'CREATE_VC_TITLE',
      message: 'Create ${name}',
      description: 'Title for the create view where ${name} is the name of the object.',
    },
  ],
  properties: [
    {
      swiftType: '(foam_core_FObject & foam_dao_DAO)',
      name: 'dao',
    },
    {
      name: 'title',
      swiftExpressionArgs: ['data'],
      swiftExpression: function() {/*
return String(
    format: type(of: self).CREATE_VC_TITLE,
    data.ownClassInfo().label)
      */}
    },
    {
      class: 'FObjectProperty',
      required: true,
      name: 'data',
      swiftExpressionArgs: ['dao$of'],
      swiftExpression: function() {/*
guard let of = dao$of as? ClassInfo else {
  fatalError("no dao of over here!")
}
return of.create(x: self.__context__) as! foam_core_FObject
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
      action: #selector(foam_swift_ui_DAOCreateViewController.onSaveButtonPressed))
}
self.onDetach(self.vc$.swiftSub({ (_, _) in
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
