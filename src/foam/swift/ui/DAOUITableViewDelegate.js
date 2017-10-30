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
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.ui.DAOTableViewSource',
      name: 'dataSource',
    },
    {
      swiftType: '((FObject) -> UIViewController)',
      swiftRequiresEscaping: true,
      name: 'updateVcFactory',
      swiftFactory: function() {/*
return { (o: FObject) -> UIViewController in
  let v = self.DetailView_create([
    "data": o,
  ])
  v.initAllViews()
  let svc = self.ScrollingViewController_create([
    "view": v,
  ])
  return svc.vc
}
      */},
    },
  ],
  swiftCode: function() {/*
public func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
  let data = (dataSource!.daoContents[indexPath.row] as! FObject) // TODO: Clone?

  let vc = updateVcFactory(data)
  (stack as? UINavigationController)?.pushViewController(vc, animated: true)
}
  */},
});
