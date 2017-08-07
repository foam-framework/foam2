import UIKit

class ViewController: UIViewController {
  lazy var data: Tabata = {
    return Context.GLOBAL.create(type: Tabata.self) as! Tabata
  }()
  lazy var sound: TabataSoundView = {
    return Context.GLOBAL.create(type: TabataSoundView.self, args: ["data": self.data]) as! TabataSoundView
  }()
  lazy var detailView: DetailView = {
    let v = DetailView()
    v.data = self.data
    return v
  }()
  override func viewDidLoad() {
    _ = self.sound

    super.viewDidLoad()
    detailView.initAllViews()
    let views: [String:UIView] = ["v": detailView.view]
    for (_, v) in views {
      v.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview(v)
    }
    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "V:|-(20)-[v]",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|-[v]-|",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
  }
}
