/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  name: 'DAOTableViewSource',
  requires: [
    'foam.dao.ArraySink',
    'foam.dao.FnSink',
  ],
  swiftImports: [
    'UIKit',
  ],
  swiftImplements: [
    'UITableViewDataSource',
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      swiftPostSet: function() {/*
if newValue == nil { return }


let findIndex = { (o: foam_core_FObject) -> Int? in
  let id = o.get(key: "id")
  return self.daoContents.index(where: { (o) -> Bool in
    let o = o as! foam_core_FObject
    return FOAM_utils.equals(id, o.get(key: "id"))
  })
}

daoSub = try? newValue!.listen(FnSink_create([
  "fn": { [weak self] str, obj, sub in
    if self == nil { return }
    if str == "add" {
      if let index = findIndex(obj as! foam_core_FObject) {
        self?.daoContents[index] = obj
        self?.tableView?.reloadRows(at: [IndexPath(row: index, section: 0)], with: .automatic)
      } else {
        self?.daoContents.append(obj)
        self?.tableView?.insertRows(at: [IndexPath(row: self!.daoContents.count - 1, section: 0)], with: .automatic)
      }
    } else if str == "remove" {
      if let index = findIndex(obj as! foam_core_FObject) {
        self?.daoContents.remove(at: index)
        self?.tableView?.deleteRows(at: [IndexPath(row: index, section: 0)], with: .automatic)
      }
    } else {
      self?.onDAOUpdate()
    }
  } as (String, Any?, Detachable) -> Void,
]), nil)

onDetach(daoSub)
onDAOUpdate()
      */},
    },
    {
      swiftType: 'Detachable?',
      name: 'daoSub',
      swiftPostSet: 'if let o = oldValue as? Detachable { o.detach() }',
    },
    {
      swiftType: 'UITableView?',
      swiftWeak: true,
      name: 'tableView',
      swiftPostSet: 'newValue?.dataSource = self',
    },
    {
      class: 'String',
      name: 'reusableCellIdentifier',
      value: 'CellID',
    },
    {
      class: 'List',
      name: 'daoContents',
    },
    {
      swiftType: '(() -> UITableViewCell)',
      swiftRequiresEscaping: true,
      name: 'rowViewFactory',
    },
    {
      swiftType: '((UITableViewCell, foam_core_FObject) -> Void)',
      swiftRequiresEscaping: true,
      name: 'rowViewPrepare',
    },
    {
      swiftType: '((IndexPath, UITableViewCell) -> Void)?',
      name: 'rowViewRemoved',
    },
  ],
  listeners: [
    {
      name: 'onDAOUpdate',
      isMerged: true,
      swiftCode: function() {/*
let sink = try? dao!.select(ArraySink_create()) as? foam_dao_ArraySink
daoContents = sink??.array ?? []
tableView?.reloadData()
      */},
    },
  ],
  methods: [
  ],
  swiftCode: function() {/*
public func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
  return daoContents.count
}

public func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
  let cell = tableView.dequeueReusableCell(withIdentifier: reusableCellIdentifier) ?? rowViewFactory()
  rowViewPrepare(cell, daoContents[indexPath.row] as! foam_core_FObject)
  return cell
}

class SimpleRowView: UITableViewCell {
  let view: UIView
  init(view: UIView, style: UITableViewCellStyle, reuseIdentifier: String?) {
    self.view = view
    super.init(style: style, reuseIdentifier: reuseIdentifier)

    var viewMap: [String:UIView] = ["v":view]
    for v in viewMap.values {
      v.translatesAutoresizingMaskIntoConstraints = false
      addSubview(v)
    }
    addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|[v]|",
      options: .alignAllCenterY,
      metrics: nil,
      views: viewMap))
    addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "V:|[v]|",
      options: .alignAllCenterY,
      metrics: nil,
      views: viewMap))
  }
  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
}
  */},
});
