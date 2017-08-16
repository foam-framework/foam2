import UIKit

class SwiftApp {
  lazy var data: Tabata = {
    return Context.GLOBAL.create(type: Tabata.self) as! Tabata
  }()
  lazy var sound: TabataSoundView = {
    return Context.GLOBAL.create(type: TabataSoundView.self, args: ["data": self.data]) as! TabataSoundView
  }()
  lazy var detailView: DetailView = {
    let dv = Context.GLOBAL.create(type: DetailView.self, args: ["data": self.data]) as! DetailView
    dv.initAllViews()
    return dv
  }()

  // TODO this shouldn't be necessary but we do this to hold onto a reference.
  private lazy var slot: Slot = {
    return self.data.timer$.dot("isStarted")
  }()

  lazy var vc: ScrollingViewController = {
    let vc = ScrollingViewController([
      "view$": self.detailView.view$,
      "title": self.data.ownClassInfo().label
      ])
    return vc
  }()
  lazy var navVc: UINavigationController = {
    return UINavigationController(rootViewController: self.vc.vc)
  }()
  func startListeners() {
    _ = self.sound
    _ = slot.swiftSub { (_, _) in
      UIApplication.shared.isIdleTimerDisabled = self.data.timer.isStarted
    }
  }
}
