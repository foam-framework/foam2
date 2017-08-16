//
//  AppDelegate.swift
//  SwiftTests
//
//  Created by Michael Carcasole on 2017-02-22.
//  Copyright © 2017 FOAM. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?


  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    let app = SwiftApp()
    app.startListeners()

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = .white
    window?.rootViewController = app.navVc
    window?.makeKeyAndVisible()
    return true
  }
}
