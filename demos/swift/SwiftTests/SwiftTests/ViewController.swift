//
//  ViewController.swift
//  SwiftTests
//
//  Created by Michael Carcasole on 2017-02-22.
//  Copyright © 2017 FOAM. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
  let o = Context.GLOBAL.create(type: Test.self) as! Test
  let firstNameLabel = FOAMUILabel()
  func swapFirstAndLast() {
    o.swapFirstAndLast()
  }
  override func viewDidLoad() {
    super.viewDidLoad()

    firstNameLabel.data$ = o.firstName$

    let b = UIButton()
    b.backgroundColor = UIColor.green
    b.setTitle("swapFirstAndLast", for: .normal)
    b.addTarget(self, action: #selector(swapFirstAndLast), for: .touchUpInside)

    let views: [String:UIView] = [
      "firstName": firstNameLabel.view,
      "button": b,
    ]

    for (_, v) in views {
      v.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview(v)
    }

    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "V:|-[firstName]-[button]-|",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|-[firstName]-|",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|-[button]-|",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
  }
}
