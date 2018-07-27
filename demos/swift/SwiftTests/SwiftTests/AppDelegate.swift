import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  let app = Context.GLOBAL.create(somepackage_TestApp.self)!
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = .white
    window?.rootViewController = app.stack
    window?.makeKeyAndVisible()

    return true
  }

}
