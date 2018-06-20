foam.CLASS({
  name: 'TestApp',
  package: 'somepackage',
  swiftImports: [
    'UIKit',
  ],
  requires: [
    'somepackage.Test',
    'foam.swift.dao.ArrayDAO',
    'foam.swift.ui.DAOTableViewSource',
    'foam.swift.ui.DAOViewController',
    'foam.swift.ui.DetailView',
    'foam.swift.ui.ScrollingViewController',
  ],
  exports: [
    'stack',
  ],
  properties: [
    {
      swiftType: 'UINavigationController',
      name: 'stack',
      swiftFactory: function() {/*
return UINavigationController(rootViewController: daoController.vc)
      */},
    },
    {
      class: 'foam.dao.DAOProperty',
      of: 'somepackage.Test',
      name: 'dao',
      swiftFactory: function() {/*
return ArrayDAO_create([
  "of": Test.classInfo(),
])
      */},
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.ui.DAOViewController',
      required: true,
      name: 'daoController',
      swiftFactory: function() {/*
let x = __subContext__
let dvc = DAOViewController_create([
  "dao$": dao$,
])

let uiLabelViewConfig = [
  "viewFactory": { (x: Context) -> FObject? in
    return x.create(FOAMUILabel.self)
  }
]

dvc.dataSource.rowViewFactory = { () -> UITableViewCell in
  let nib = UINib(nibName: "TestRowView", bundle: Bundle.main)
  let customView = nib.instantiate(withOwner: dvc.vc, options: nil)[0] as! TestDetailView
  customView.dv_Test = x.create(DetailView.self, args: [
    "of": Test.classInfo(),
    "config": [
      "firstName": uiLabelViewConfig,
      "lastName": uiLabelViewConfig,
      "exprProp": uiLabelViewConfig,
    ]
  ])!
  let cell = DAOTableViewSource.SimpleRowView(
      view: customView, style: .default, reuseIdentifier: dvc.dataSource.reusableCellIdentifier)
  return cell
}
dvc.dataSource.rowViewPrepare = { (cell, fobj) -> Void in
  let cell = cell as! DAOTableViewSource.SimpleRowView
  let view = cell.view as! TestDetailView
  view.dv_Test?.data = fobj
}

dvc.tableViewDelegate?.updateVcFactory = { (o: FObject) -> UIViewController in
  let dv = self.DetailView_create([
    "data": o,
    "config": [
      "exprProp": [
        "viewFactory": { (x: Context) -> FObject? in
          return x.create(FOAMUILabel.self)
        }
      ]
    ]
  ])

  let svc = self.ScrollingViewController_create([
    "view": dv,
  ])

  let nib = UINib(nibName: "CustomView", bundle: Bundle.main)
  let customView = nib.instantiate(withOwner: svc.vc, options: nil)[0] as! TestDetailView
  customView.dv_Test = dv

  return svc.vc
}

return dvc
      */},
    },
  ],
  methods: [
    {
      name: 'init',
      swiftCode: function() {/*
DispatchQueue.global(qos: .background).async {
  var i = 1
  Async.aWhile(
    { () -> Bool in
      return i <= 50
  },
    afunc: Async.aSeq([
      Async.aWait(delay: 0.1),
      { ret, _, _ in
        _ = try! self.dao!.put(self.Test_create([
          "firstName": "Dude \(i)",
        ]))
        i += 1
        ret(nil)
      }
      ])
    )({_ in }, {_ in }, nil)
}
      */},
    },
  ],
});
