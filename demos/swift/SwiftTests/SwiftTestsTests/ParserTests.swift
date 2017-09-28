//
//  ParserTests.swift
//  SwiftTests
//
//  Created by Michael Carcasole on 2017-09-14.
//  Copyright © 2017 FOAM. All rights reserved.
//

import Foundation
import XCTest
@testable import SwiftTests

class ParserTests: XCTestCase {
  let x = ParserContext()

  override func setUp() {
    super.setUp()
  }

  override func tearDown() {
    super.tearDown()
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
    XCTAssertEqual(parser.parse(StringPStream(["str": "52.5"]), x)!.value()! as! Float, 52.5)
    XCTAssertEqual(parser.parse(StringPStream(["str": "0.1"]), x)!.value()! as! Float, 0.1)
    XCTAssertEqual(parser.parse(StringPStream(["str": "1."]), x)!.value()! as! Float, 1.0)
    XCTAssertEqual(parser.parse(StringPStream(["str": "-0.1123"]), x)!.value()! as! Float, -0.1123)
    XCTAssertNil(parser.parse(StringPStream(["str": "-50"]), x))
  }

  func testIntParser() {
    let parser = IntParser()
    XCTAssertNil(parser.parse(StringPStream(["str": "KEY"]), x))
    XCTAssertEqual(parser.parse(StringPStream(["str": "0.1"]), x)!.value()! as! Int, 0)
    XCTAssertEqual(parser.parse(StringPStream(["str": "1."]), x)!.value()! as! Int, 1)
    XCTAssertEqual(parser.parse(StringPStream(["str": "-0.1123"]), x)!.value()! as! Int, 0)
    XCTAssertEqual(parser.parse(StringPStream(["str": "-50"]), x)!.value()! as! Int, -50)
  }
}
