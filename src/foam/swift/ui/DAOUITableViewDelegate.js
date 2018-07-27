/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.swift.ui',
  name: 'DAOUITableViewDelegate',
  imports: [
    'stack',
  ],
  requires: [
    'foam.swift.ui.DAOTableViewSource',
    'foam.swift.ui.DetailView',
    'foam.swift.ui.ScrollingViewController',
  ],
  swiftImports: [
    'UIKit',
  ],
  swiftImplements: [
    'UITableViewDelegate',
  ],
  messages: [
    {
      name: 'UPDATE_VC_TITLE',
      message: 'Update ${name}',
      description: 'Title for the update view where ${name} is the name of the object.',
    },
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.ui.DAOTableViewSource',
      name: 'dataSource',
    },
    {
      swiftType: 'UITableViewRowAction',
      name: 'deleteAction',
      swiftFactory: function() {/*
return UITableViewRowAction(style: .destructive, title: "Delete") { (_, indexPath) in
  _ = try? self.dataSource?.dao?.remove(
      self.dataSource?.daoContents[indexPath.row] as! foam_core_FObject)
}
      */},
    },
    {
      swiftType: '((foam_core_FObject) -> UIViewController)',
      swiftRequiresEscaping: true,
      name: 'updateVcFactory',
      swiftFactory: function() {/*
return { (o: foam_core_FObject) -> UIViewController in
  let v = self.DetailView_create([
    "data": o,
  ])
  v.initAllViews()
  let svc = self.ScrollingViewController_create([
    "view": v,
  ])

  svc.title = String(
      format: type(of: self).UPDATE_VC_TITLE,
      o.ownClassInfo().label)

  return svc.vc
}
      */},
    },
  ],
  swiftCode: function() {/*
public func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
  let data = (dataSource!.daoContents[indexPath.row] as! foam_core_FObject) // TODO: Clone?

  let vc = updateVcFactory(data)
  (stack as? UINavigationController)?.pushViewController(vc, animated: true)
}

public func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath) -> [UITableViewRowAction]? {
  return [deleteAction]
}

public func tableView(_ tableView: UITableView, didEndDisplaying cell: UITableViewCell, forRowAt indexPath: IndexPath) {
  dataSource?.rowViewRemoved?(indexPath, cell)
}
  */},
});
