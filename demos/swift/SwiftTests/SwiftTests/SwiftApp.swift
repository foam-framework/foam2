import UIKit

class SwiftApp {
  lazy var data: Test = {
    return Context.GLOBAL.create(Test.self)!
  }()

  lazy var scrollVc: ScrollingViewController = {

    let dv = Context.GLOBAL.create(DetailView.self, args: [
      "data": self.data,
      "config": [
        "exprProp": [
          "viewFactory": { (x: Context) -> FObject? in
            return x.create(FOAMUILabel.self)
          }
        ]
      ]
    ])!

    let svc = ScrollingViewController([
      "view": dv,
      "title": self.data.ownClassInfo().label
    ])

    let nib = UINib(nibName: "CustomView", bundle: Bundle.main)
    let customView = nib.instantiate(withOwner: svc.vc, options: nil)[0] as! TestDetailView
    customView.dv_Test = dv

    return svc
  }()

  lazy var navVc: UINavigationController = {
    return UINavigationController(rootViewController: scrollVc.vc)
  }()
}
