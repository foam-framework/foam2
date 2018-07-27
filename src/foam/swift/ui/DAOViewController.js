/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'DAOViewController',

  imports: [
    'stack'
  ],

  requires: [
    'foam.swift.ui.DAOCreateViewController',
    'foam.swift.ui.DAOTableViewSource',
    'foam.swift.ui.DAOUITableViewDelegate',
    'foam.swift.ui.ScrollingViewController'
  ],

  swiftImports: [
    'UIKit'
  ],

  swiftImplements: [
    'UITableViewDelegate'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.ui.DAOTableViewSource',
      required: true,
      name: 'dataSource',
      swiftFactory: function() {/*
let dataSource = DAOTableViewSource_create([
  "dao$": self.dao$,
])
return dataSource
      */}
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.ui.DAOUITableViewDelegate',
      name: 'tableViewDelegate',
      swiftFactory: function() {/*
return DAOUITableViewDelegate_create([
  "dataSource$": dataSource$,
])
      */}
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.ui.DAOCreateViewController',
      required: true,
      name: 'createVc',
      swiftFactory: function() {/*
return DAOCreateViewController_create([
  "dao": dao,
])
      */},
    },
    {
      swiftType: 'UITableViewController',
      name: 'vc',
      swiftFactory: function() {/*
let tvc = UITableViewController()
tvc.navigationItem.rightBarButtonItem = UIBarButtonItem(
    barButtonSystemItem: .add,
    target: self,
    action: #selector(foam_swift_ui_DAOViewController.onCreate))

if let of = dao?.get(key: "of") as? ClassInfo {
  tvc.title = of.label
}

return tvc
      */},
      swiftPostSet: function() {/*
dataSource.tableView = newValue.tableView
newValue.tableView.delegate = tableViewDelegate
      */}
    },
  ],

  methods: [
    {
      name: 'onCreate',
      swiftAnnotations: ['@objc'],
      swiftCode: function() {/*
createVc.clearProperty("data")
(stack as? UINavigationController)?.pushViewController(createVc.vc, animated: true)
      */}
    }
  ]
});
