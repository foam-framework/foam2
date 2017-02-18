//: Playground - noun: a place where people can play

import UIKit
import XCTest

let test = Test()

var numPubs = 0
let sub = test.sub(listener: { (sub: Subscription, args: [Any]) -> Void in
  numPubs += 1
  sub.detach()
})

var numPubs2 = 0
_ = test.sub(listener: { (sub: Subscription, args: [Any]) -> Void in
  numPubs2 += 1
})

var numPubs3 = 0
_ = test.lastName$.sub(listener: { (sub: Subscription, args: [Any]) -> Void in
  numPubs3 += 1
})

test.firstName = "YO"
test.lastName = "RAPTAS"
test.sayHi()
NSLog(test.methodWithAnArgAndReturn("MY_NAME"))

XCTAssertEqual(numPubs, 1)
XCTAssertEqual(numPubs2, 2)
XCTAssertEqual(numPubs3, 1)

sub.detach() // Should do nothing.

test.factoryProp