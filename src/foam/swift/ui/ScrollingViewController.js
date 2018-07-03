/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.ui',
  name: 'ScrollingViewController',
  swiftImports: [
    'UIKit',
  ],
  properties: [
    {
      class: 'FObjectProperty',
      required: false,
      name: 'view',
    },
    {
      class: 'String',
      name: 'title',
      swiftExpressionArgs: ['view$title'],
      swiftExpression: function() {/*
return view$title as? String ?? ""
      */},
    },
    {
      swiftType: 'UIColor',
      name: 'backgroundColor',
      swiftValue: 'UIColor.white',
    },
    {
      swiftType: 'UIViewController',
      name: 'vc',
      swiftExpressionArgs: ['view$view', 'title', 'backgroundColor'],
      swiftExpression: function() {/*
let vc = VC_()
vc.innerView = view$view as! UIView
vc.title = title
vc.backgroundColor = backgroundColor
return vc
      */},
    },
  ],
  swiftCode: function() {/*
class VC_: UIViewController {
  let scrollView: UIScrollView = {
    let scrollView = UIScrollView()
    scrollView.keyboardDismissMode = .onDrag
    return scrollView
  }()
  var innerView: UIView!
  var backgroundColor: UIColor!
  override func viewDidLoad() {
    super.viewDidLoad()

    view.backgroundColor = backgroundColor

    view.addSubview(scrollView)
    scrollView.addSubview(innerView)

    let views: [String:UIView] = ["v": innerView, "sv": scrollView]
    for (_, v) in views {
      v.translatesAutoresizingMaskIntoConstraints = false
    }

    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "V:|-[v]-|",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
    view.addConstraint(NSLayoutConstraint(
      item: innerView,
      attribute: .width,
      relatedBy: .equal,
      toItem: view,
      attribute: .width,
      multiplier: 1,
      constant: 0))
    view.addConstraint(NSLayoutConstraint(
      item: innerView,
      attribute: .left,
      relatedBy: .equal,
      toItem: view,
      attribute: .left,
      multiplier: 1,
      constant: 0))

    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "H:|[sv]|",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
    view.addConstraints(NSLayoutConstraint.constraints(
      withVisualFormat: "V:|[sv]|",
      options: NSLayoutFormatOptions.init(rawValue: 0),
      metrics: nil,
      views: views))
  }

  lazy var tap: UITapGestureRecognizer = {
    return UITapGestureRecognizer(target: self, action: #selector(onTap))
  }()
  @objc public func onTap() {
    view.endEditing(true)
  }
  var onKeyboardFrameChangeObserver: Any?
  var onKeyboardShownObserver: Any?
  var onKeyboardHiddenObserver: Any?
  var keyboardShown = false
  override func viewDidAppear(_ animated: Bool) {
    view.addGestureRecognizer(tap)
    onKeyboardFrameChangeObserver = NotificationCenter.default.addObserver(
      forName: NSNotification.Name.UIKeyboardDidChangeFrame,
      object: nil,
      queue: nil) { (n) in
        if !self.keyboardShown { return }
        let kbSize: CGSize = (n.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? CGRect)?.size ?? CGSize()
        self.scrollView.contentInset.bottom = kbSize.height
        self.scrollView.scrollIndicatorInsets.bottom = kbSize.height
    }
    onKeyboardShownObserver = NotificationCenter.default.addObserver(
      forName: NSNotification.Name.UIKeyboardWillShow,
      object: nil,
      queue: nil) { (n) in
        self.keyboardShown = true
    }
    onKeyboardHiddenObserver = NotificationCenter.default.addObserver(
      forName: NSNotification.Name.UIKeyboardDidHide,
      object: nil,
      queue: nil) { (n) in
        self.keyboardShown = false
        self.scrollView.contentInset.bottom = 0
        self.scrollView.scrollIndicatorInsets.bottom = 0
    }

  }
  override func viewDidDisappear(_ animated: Bool) {
    view.removeGestureRecognizer(tap)
    if onKeyboardFrameChangeObserver != nil {
      NotificationCenter.default.removeObserver(onKeyboardFrameChangeObserver!)
      NotificationCenter.default.removeObserver(onKeyboardHiddenObserver!)
      NotificationCenter.default.removeObserver(onKeyboardShownObserver!)
    }
  }
}
  */},
});

