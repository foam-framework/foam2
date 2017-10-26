import UIKit

class SwiftApp {

  init() {
    tvc.tableView.dataSource = self.dataSource
    tvc.tableView.delegate = tvd
  }

  lazy var tvd: UITableViewDelegate = {
    class TVD: NSObject, UITableViewDelegate {
      var app: SwiftApp!
      func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let dv = app.x.create(DetailView.self, args: [
          "data": app.dataSource.daoContents[indexPath.row],
          "config": [
            "exprProp": [
              "viewFactory": { (x: Context) -> FObject? in
                return x.create(FOAMUILabel.self)
              }
            ]
          ]
        ])!

        let svc = app.x.create(ScrollingViewController.self, args: [
          "view": dv,
        ])!

        let nib = UINib(nibName: "CustomView", bundle: Bundle.main)
        let customView = nib.instantiate(withOwner: svc.vc, options: nil)[0] as! TestDetailView
        customView.dv_Test = dv

        app.navVc.pushViewController(svc.vc, animated: true)
      }
    }
    let tvd = TVD()
    tvd.app = self
    return tvd
  }()

  lazy var x: Context = Context.GLOBAL

  lazy var data: Test = {
    return self.x.create(Test.self)!
  }()

  lazy var navVc: UINavigationController = {
    return UINavigationController(rootViewController: tvc)
  }()

  lazy var dao: (DAO & FObject) = {
    let dao = x.create(ArrayDAO.self, args: [
      "of": Test.classInfo(),
      "primaryKey": Test.FIRST_NAME(),
    ])!

    DispatchQueue.global(qos: .background).async {
      var i = 1
      Async.aWhile(
        { () -> Bool in
          return i <= 200
        },
        afunc: Async.aSeq([
          Async.aWait(delay: 0.1),
          { ret, _, _ in
            _ = try! dao.put(self.x.create(Test.self, args: [
              "firstName": "Dude \(i)",
              ])!) as! Test
            i += 1
            ret(nil)
          }
        ])
      )({_ in }, {_ in }, nil)
    }

    return dao
  }()

  let tvc: UITableViewController = UITableViewController()

  lazy var dataSource: DAOTableViewSource = {
    let dataSource = x.create(DAOTableViewSource.self, args: [
      "dao": self.dao,
      ])!
    dataSource.rowViewFactory = { () -> UITableViewCell in
      let nib = UINib(nibName: "TestRowView", bundle: Bundle.main)
      let customView = nib.instantiate(withOwner: self.tvc, options: nil)[0] as! TestDetailView
      customView.dv_Test = self.x.create(DetailView.self, args: [
        "of": Test.classInfo(),
        "config": [
          "firstName": [
            "viewFactory": { (x: Context) -> FObject? in
              return x.create(FOAMUILabel.self)
            }
          ],
          "lastName": [
            "viewFactory": { (x: Context) -> FObject? in
              return x.create(FOAMUILabel.self)
            }
          ],
          "exprProp": [
            "viewFactory": { (x: Context) -> FObject? in
              return x.create(FOAMUILabel.self)
            }
          ]
        ]
        ])!
      let cell = DAOTableViewSource.SimpleRowView(
          view: customView, style: .default, reuseIdentifier: dataSource.reusableCellIdentifier)
      return cell
    }
    dataSource.rowViewPrepare = { (cell, fobj) -> Void in
      let cell = cell as! DAOTableViewSource.SimpleRowView
      let view = cell.view as! TestDetailView
      view.dv_Test?.data = fobj
    }
    dataSource.tableView = tvc.tableView
    return dataSource
  }()
}
