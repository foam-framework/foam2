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
  let X = Context.GLOBAL

  override func setUp() {
    super.setUp()
  }

  override func tearDown() {
    super.tearDown()
  }

  func testCharsParse() {
    let parser = foam_swift_parse_parser_Alt([
      "parsers": [
        foam_swift_parse_parser_Chars(["chars": "A"]),
        foam_swift_parse_parser_Chars(["chars": " "]),
      ],
      ])
    var ps: foam_swift_parse_PStream! = foam_swift_parse_StringPStream(["str": "A string"])

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
    let parser = foam_swift_parse_parser_AnyChar()
    var ps: foam_swift_parse_PStream! = foam_swift_parse_StringPStream(["str": "123"])

    ps = parser.parse(ps, x) // 1
    XCTAssertNotNil(ps)

    ps = parser.parse(ps, x) // 2
    XCTAssertNotNil(ps)

    ps = parser.parse(ps, x) // 3
    XCTAssertNotNil(ps)

    ps = parser.parse(ps, x) // Error
    XCTAssertNil(ps)
  }


  func testfoam_swift_parse_parser_LiteralParse() {
    let parser = foam_swift_parse_parser_Literal(["string": "myfoam_swift_parse_parser_Literal"])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "hello"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "myfoam_swift_parse_parser_LiteralHello"]), x))
  }

  func testfoam_swift_parse_parser_NotCharsParse() {
    let parser = foam_swift_parse_parser_NotChars(["chars": "ABC"])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "AHello"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "Hello"]), x))
  }

  func testRepeat() {
    let parser = foam_swift_parse_parser_Repeat([
      "delegate": foam_swift_parse_parser_Chars(["chars": "A"]),
      "delim": foam_swift_parse_parser_Chars(["chars": ","]),
      "min": 3,
      "max": 5,
      ])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A,A"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A,A,A"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A,A,A,A"]), x))
    XCTAssertEqual(parser.parse(
      foam_swift_parse_StringPStream(["str": "A,A,A"]), x)!.value()! as! [Character],
                   ["A","A","A"] as [Character])
  }

  func testfoam_swift_parse_parser_Repeat0() {
    let parser = foam_swift_parse_parser_Repeat0([
      "delegate": foam_swift_parse_parser_Chars(["chars": "A"]),
      "delim": foam_swift_parse_parser_Chars(["chars": ","]),
      "min": 3,
      "max": 5,
      ])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A,A"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A,A,A"]), x))
    XCTAssertNotNil(parser.parse(foam_swift_parse_StringPStream(["str": "A,A,A,A,A"]), x))
    XCTAssertEqual(parser.parse(
      foam_swift_parse_StringPStream(["str": "A,A,A,A,A"]), x)!.value()! as! Character,
                   "A")
  }

  func testfoam_swift_parse_parser_Seq() {
    let parser = foam_swift_parse_parser_Seq([
      "parsers": [
        foam_swift_parse_parser_Chars(["chars": "A"]),
        foam_swift_parse_parser_Chars(["chars": "B"]),
      ]
      ])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "AAB"]), x))
    XCTAssertEqual(
      parser.parse(foam_swift_parse_StringPStream(["str": "ABB"]), x)!.value()! as! [Character],
      ["A", "B"])
  }

  func testfoam_swift_parse_parser_Seq0() {
    let parser = foam_swift_parse_parser_Seq0([
      "parsers": [
        foam_swift_parse_parser_Chars(["chars": "A"]),
        foam_swift_parse_parser_Chars(["chars": "B"]),
      ]
      ])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "AAB"]), x))
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "ABC"]), x)!.value()! as! Character, "B")
  }

  func testfoam_swift_parse_parser_Seq1() {
    let parser = foam_swift_parse_parser_Seq1([
      "parsers": [
        foam_swift_parse_parser_Chars(["chars": "A"]),
        foam_swift_parse_parser_Chars(["chars": "B"]),
      ],
      "index": 0,
      ])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "AAB"]), x))
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "ABC"]), x)!.value()! as! Character, "A")
  }

  func testfoam_swift_parse_parser_Seq2() {
    let parser = foam_swift_parse_parser_Seq2([
      "parsers": [
        foam_swift_parse_parser_Chars(["chars": "A"]),
        foam_swift_parse_parser_Chars(["chars": "B"]),
        foam_swift_parse_parser_Chars(["chars": "C"]),
      ],
      "index1": 0,
      "index2": 2,
      ])
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "AB"]), x))
    XCTAssertEqual(
      parser.parse(foam_swift_parse_StringPStream(["str": "ABCD"]), x)!.value()! as! [Character],
      ["A", "C"])
  }

  func testSubstring() {
    let parser = foam_swift_parse_parser_Substring([
      "delegate": foam_swift_parse_parser_Repeat([
        "delegate": foam_swift_parse_parser_Chars(["chars": "BA"]),
        ])
      ])
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "ABCDEFG"]), x)!.value()! as! String, "AB")
  }

  func testAnyKeyParser() {
    let parser = X.create(foam_swift_parse_json_AnyKeyParser.self)!
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "KEY"]), x)!.value()! as! String, "KEY")
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "\"KEY\": "]), x)!.value()! as! String, "KEY")
  }

  func testFloatParser() {
    let parser = foam_swift_parse_json_FloatParser()
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "KEY"]), x))
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "52.5"]), x)!.value()! as! Float, 52.5)
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "0.1"]), x)!.value()! as! Float, 0.1)
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "1."]), x)!.value()! as! Float, 1.0)
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "-0.1123"]), x)!.value()! as! Float, -0.1123)
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "-50"]), x))
  }

  func testIntParser() {
    let parser = foam_swift_parse_json_IntParser()
    XCTAssertNil(parser.parse(foam_swift_parse_StringPStream(["str": "KEY"]), x))
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "0.1"]), x)!.value()! as! Int, 0)
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "1."]), x)!.value()! as! Int, 1)
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "-0.1123"]), x)!.value()! as! Int, 0)
    XCTAssertEqual(parser.parse(foam_swift_parse_StringPStream(["str": "-50"]), x)!.value()! as! Int, -50)
  }
}
