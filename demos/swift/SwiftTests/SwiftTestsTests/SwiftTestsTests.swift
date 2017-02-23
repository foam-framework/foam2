import XCTest
@testable import SwiftTests

class SwiftTestsTests: XCTestCase {

  override func setUp() {
    super.setUp()
  }

  override func tearDown() {
    super.tearDown()
  }

  func testListen() {
    let test = Test()
    var numPubs = 0
    let sub = test.sub(listener: { (sub: Subscription, args: [Any]) -> Void in
      numPubs += 1
      sub.detach()
    })

    var numPubs2 = 0
    let sub2 = test.sub(listener: { (sub: Subscription, args: [Any]) -> Void in
      numPubs2 += 1
    })

    var numPubs3 = 0
    let sub3 = test.lastName$.sub(listener: { (sub: Subscription, args: [Any]) -> Void in
      numPubs3 += 1
    })

    test.firstName = "1"
    test.lastName = "2"
    test.sayHi()
    NSLog(test.methodWithAnArgAndReturn("3"))

    XCTAssertEqual(numPubs, 1)
    XCTAssertEqual(numPubs2, 2)
    XCTAssertEqual(numPubs3, 1)

    sub.detach() // Should do nothing.
    sub2.detach()
    sub3.detach()
  }

  func testFollow() {
    let o1 = Test()
    let o2 = Test()
    o1.firstName = "A"
    o2.firstName$ = o1.firstName$
    XCTAssertEqual(o2.firstName, "A")
    o2.firstName = "B"
    XCTAssertEqual(o1.firstName, "B")
    o2.firstName_Value_Sub_?.detach()
  }

  func testMemLeaks() {
    for _ in 1...20000 {
      testFollow()
      testListen()
    }
  }

}
