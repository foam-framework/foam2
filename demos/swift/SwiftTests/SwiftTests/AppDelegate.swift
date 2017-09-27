import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?


  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

    FOAM_utils.registerClasses()

    let app = SwiftApp()
    app.startListeners()

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = .white
    window?.rootViewController = app.navVc
    window?.makeKeyAndVisible()

    return true
  }
}
