import UIKit

class SwiftApp {
  lazy var data: Tabata = {
    return Context.GLOBAL.create(type: Tabata.self) as! Tabata
  }()

  lazy var navVc: UINavigationController = {

    let dv = Context.GLOBAL.create(type: DetailView.self, args: ["data": self.data]) as! DetailView
    dv.initAllViews()

    let vc = ScrollingViewController([
      "view$": dv.view$,
      "title": self.data.ownClassInfo().label
    ])

    return UINavigationController(rootViewController: vc.vc)
  }()
  func startListeners() {
    _ = Context.GLOBAL.create(type: TabataSoundView.self, args: ["data": self.data])
    _ = data.timer$.dot("isStarted").swiftSub { (_, _) in
      UIApplication.shared.isIdleTimerDisabled = self.data.timer.isStarted
    }
  }
}
