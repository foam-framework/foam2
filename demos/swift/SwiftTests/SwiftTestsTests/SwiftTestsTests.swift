import XCTest
@testable import SwiftTests

class SwiftTestsTests: XCTestCase {

  let x = Context.GLOBAL

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
    XCTAssertEqual(test.methodWithAnArgAndReturn("3"), "Hello there 3 LASTNAME")

    XCTAssertEqual(numPubs, 1)
    XCTAssertEqual(numPubs2, 4) // Each set to first or last name triggers another set.
    XCTAssertEqual(numPubs3, 1)

    sub.detach() // Should do nothing.
    sub2.detach()
    sub3.detach()
  }

  func testFollow() {
    let o1 = Test(["firstName": "A"])
    let o2 = Test(["firstName$": o1.firstName$])
    XCTAssertEqual(o2.firstName, "A")
    o2.firstName = "B"
    XCTAssertEqual(o1.firstName, "B")
    o2.firstName_Value_Sub_?.detach()
  }

  func testMemLeaks() {
    for _ in 1...5000 {
      testFollow()
      testListen()
    }
  }

  func testObjectCreationPerformance() {
    self.measure {
      for _ in 1...1000 {
        _ = Test()
      }
    }
  }

  func testCharsParse() {
    let parser = Alt([
      "parsers": [
        Chars(["chars": "A"]),
        Chars(["chars": " "]),
      ],
    ])
    var ps: PStream! = StringPStream(["str": "A string"])

    // Parsing first character.
    ps = parser.parse(ps, x)
    XCTAssertNotNil(ps)

    // Parsing second character.
    ps = parser.parse(ps, x)
    XCTAssertNotNil(ps)

    // Parsing third character.
    ps = parser.parse(ps, x)
    XCTAssertNil(ps)
  }

  func testAnyCharParse() {
    let parser = AnyChar()
    var ps: PStream! = StringPStream(["str": "123"])

    ps = parser.parse(ps, x) // 1
    XCTAssertNotNil(ps)

    ps = parser.parse(ps, x) // 2
    XCTAssertNotNil(ps)

    ps = parser.parse(ps, x) // 3
    XCTAssertNotNil(ps)

    ps = parser.parse(ps, x) // Error
    XCTAssertNil(ps)
  }


  func testLiteralParse() {
    let parser = Literal(["string": "myLiteral"])
    XCTAssertNil(parser.parse(StringPStream(["str": "hello"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "myLiteralHello"]), x))
  }

  func testNotCharsParse() {
    let parser = NotChars(["chars": "ABC"])
    XCTAssertNil(parser.parse(StringPStream(["str": "AHello"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "Hello"]), x))
  }

  func testRepeat() {
    let parser = Repeat([
      "delegate": Chars(["chars": "A"]),
      "delim": Chars(["chars": ","]),
      "min": 3,
      "max": 5,
    ])
    XCTAssertNil(parser.parse(StringPStream(["str": "A,A"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "A,A,A"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "A,A,A,A"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "A,A,A,A,A"]), x))
    XCTAssertEqual(parser.parse(
        StringPStream(["str": "A,A,A"]), x)!.value()! as! [Character],
        ["A","A","A"] as [Character])
  }

  func testRepeat0() {
    let parser = Repeat0([
      "delegate": Chars(["chars": "A"]),
      "delim": Chars(["chars": ","]),
      "min": 3,
      "max": 5,
      ])
    XCTAssertNil(parser.parse(StringPStream(["str": "A,A"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "A,A,A"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "A,A,A,A"]), x))
    XCTAssertNotNil(parser.parse(StringPStream(["str": "A,A,A,A,A"]), x))
    XCTAssertEqual(parser.parse(
        StringPStream(["str": "A,A,A,A,A"]), x)!.value()! as! Character,
        "A")
  }

  func testSeq() {
    let parser = Seq([
      "parsers": [
        Chars(["chars": "A"]),
        Chars(["chars": "B"]),
      ]
    ])
    XCTAssertNil(parser.parse(StringPStream(["str": "AAB"]), x))
    XCTAssertEqual(
      parser.parse(StringPStream(["str": "ABB"]), x)!.value()! as! [Character],
      ["A", "B"])
  }

  func testSeq0() {
    let parser = Seq0([
      "parsers": [
        Chars(["chars": "A"]),
        Chars(["chars": "B"]),
      ]
    ])
    XCTAssertNil(parser.parse(StringPStream(["str": "AAB"]), x))
    XCTAssertEqual(parser.parse(StringPStream(["str": "ABC"]), x)!.value()! as! Character, "B")
  }

  func testSeq1() {
    let parser = Seq1([
      "parsers": [
        Chars(["chars": "A"]),
        Chars(["chars": "B"]),
      ],
      "index": 0,
    ])
    XCTAssertNil(parser.parse(StringPStream(["str": "AAB"]), x))
    XCTAssertEqual(parser.parse(StringPStream(["str": "ABC"]), x)!.value()! as! Character, "A")
  }

  func testSeq2() {
    let parser = Seq2([
      "parsers": [
        Chars(["chars": "A"]),
        Chars(["chars": "B"]),
        Chars(["chars": "C"]),
      ],
      "index1": 0,
      "index2": 2,
    ])
    XCTAssertNil(parser.parse(StringPStream(["str": "AB"]), x))
    XCTAssertEqual(
      parser.parse(StringPStream(["str": "ABCD"]), x)!.value()! as! [Character],
      ["A", "C"])
  }

  func testSubstring() {
    let parser = Substring([
      "delegate": Repeat([
        "delegate": Chars(["chars": "BA"]),
      ])
    ])
    XCTAssertEqual(parser.parse(StringPStream(["str": "ABCDEFG"]), x)!.value()! as! String, "AB")
  }

  func testAnyKeyParser() {
    let parser = AnyKeyParser()
    XCTAssertEqual(parser.parse(StringPStream(["str": "KEY"]), x)!.value()! as! String, "KEY")
    XCTAssertEqual(parser.parse(StringPStream(["str": "\"KEY\": "]), x)!.value()! as! String, "KEY")
  }

  func testFloatParser() {
    let parser = FloatParser()
    XCTAssertNil(parser.parse(StringPStream(["str": "KEY"]), x))
    XCTAssertEqual(parser.parse(StringPStream(["str": "0.1"]), x)!.value()! as! Float, 0.1)
    XCTAssertEqual(parser.parse(StringPStream(["str": "1."]), x)!.value()! as! Float, 1.0)
    XCTAssertEqual(parser.parse(StringPStream(["str": "-0.1123"]), x)!.value()! as! Float, -0.1123)
    XCTAssertEqual(parser.parse(StringPStream(["str": "-50"]), x)!.value()! as! Float, -50.0)
  }

  func testIntParser() {
    let parser = IntParser()
    XCTAssertNil(parser.parse(StringPStream(["str": "KEY"]), x))
    XCTAssertEqual(parser.parse(StringPStream(["str": "0.1"]), x)!.value()! as! Int, 0)
    XCTAssertEqual(parser.parse(StringPStream(["str": "1."]), x)!.value()! as! Int, 1)
    XCTAssertEqual(parser.parse(StringPStream(["str": "-0.1123"]), x)!.value()! as! Int, 0)
    XCTAssertEqual(parser.parse(StringPStream(["str": "-50"]), x)!.value()! as! Int, -50)
  }

  func testFObjectParse() {
    let x = Context.GLOBAL.createSubContext(args: [
      "X": Context.GLOBAL,
      "Test": Test.self,
    ])
    let ps = FObjectParser().parse(
        StringPStream(["str": "{class:'Test', prevFirstName: \"MY_PREV_NAME\"}"]), x)
    XCTAssertTrue(ps!.value() is Test)
    XCTAssertEqual((ps!.value() as! Test).prevFirstName, "MY_PREV_NAME")
  }

  func testToJSON() {
    let t = Test()
    t.prevFirstName = "MY_PREV_NAME"
    t.boolProp = false
    t.intProp = 34
    XCTAssertEqual(Outputter().swiftStringify(t),
    "{\"class\":\"Test\",\"intProp\":34,\"boolProp\":false,\"prevFirstName\":\"MY_PREV_NAME\"}")
  }
}
