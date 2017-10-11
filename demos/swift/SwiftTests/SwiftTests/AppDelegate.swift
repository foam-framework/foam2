import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?


  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = .white
//    let app = SwiftApp()
//    app.startListeners()
//    window?.rootViewController = app.navVc
    window?.rootViewController = UIViewController()
    window?.makeKeyAndVisible()

    return true
  }
}
