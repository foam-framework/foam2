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
    let test = somepackage_Test()
    var numPubs = 0
    _ = test.sub(listener: { (sub: Subscription, args: [Any?]) -> Void in
      numPubs += 1
      sub.detach()
    })

    var numPubs2 = 0
    _ = test.sub(listener: { (sub: Subscription, args: [Any?]) -> Void in
      numPubs2 += 1
    })

    var numPubs3 = 0
    _ = test.lastName$.swiftSub({ (sub: Subscription, args: [Any?]) -> Void in
      numPubs3 += 1
    })

    test.firstName = "1"
    test.lastName = "2"
    XCTAssertEqual(test.methodWithAnArgAndReturn("3"), "Hello there 3 LASTNAME")

    XCTAssertEqual(numPubs, 1)
    XCTAssertEqual(numPubs2, 4) // Each set to first or last name triggers another set.
    XCTAssertEqual(numPubs3, 1)

    test.detach()
  }

  func testFollow() {
    let o1 = somepackage_Test(["firstName": "A"])
    let o2 = somepackage_Test(["firstName$": o1.firstName$])
    XCTAssertEqual(o2.firstName, "A")
    o2.firstName = "B"
    XCTAssertEqual(o1.firstName, "B")
    o1.detach()
    o2.detach()
  }

  func testObjectCreationPerformance() {
    self.measure {
      for _ in 1...1000 {
        _ = somepackage_Test()
      }
    }
  }

  func testFObjectParse() {
    let ps = foam_swift_parse_json_FObjectParser().parseString("{class:'somepackage.Test', prevFirstName: \"MY_PREV_NAME\",\"enumProp\":{class:\"foam.u2.Visibility\",ordinal:1}}")
    XCTAssertTrue(ps is somepackage_Test)
    XCTAssertEqual((ps as! somepackage_Test).prevFirstName, "MY_PREV_NAME")
    XCTAssertEqual((ps as! somepackage_Test).enumProp, foam_u2_Visibility.FINAL)
  }

  func testToJSON() {
    let t = somepackage_Test()
    t.prevFirstName = "MY_PREV_NAME"
    t.boolProp = false
    t.intProp = 34
    t.enumProp = foam_u2_Visibility.FINAL // Outputs as just the ordinal
    t.anyProp = foam_u2_Visibility.FINAL // Outputs as the full fobject
    XCTAssertEqual(foam_swift_parse_json_output_Outputter().swiftStringify(t),
    "{\"class\":\"somepackage.Test\",\"anyProp\":{\"class\":\"foam.u2.Visibility\",\"ordinal\":1},\"intProp\":34,\"boolProp\":false,\"prevFirstName\":\"MY_PREV_NAME\",\"enumProp\":1}")
  }

  func testExpression() {
    let t = somepackage_Test()
    t.firstName = "Mike"
    t.lastName = "C"
    XCTAssertEqual(t.exprProp, "Mike C")
    t.lastName = "D"
    XCTAssertEqual(t.exprProp, "Mike D")

    t.exprProp = "OVERRIDE"
    XCTAssertEqual(t.exprProp, "OVERRIDE")
    t.firstName = "Nope"
    XCTAssertEqual(t.exprProp, "OVERRIDE")
    t.detach()
  }

  func testCompare() {
    let t1 = somepackage_Test()
    let t2 = somepackage_Test()
    XCTAssertEqual(t1.compareTo(t2), 0)
    t1.firstName = "NOT T2"
    XCTAssertEqual(t1.compareTo(t2), 1)
    t2.firstName = "NOT T2"
    XCTAssertEqual(t1.compareTo(t2), 0)
    t1.clearProperty("firstName")
    XCTAssertEqual(t1.compareTo(t2), -1)
  }

  func testfoam_swift_dao_ArrayDAO() {
    let dao = foam_swift_dao_ArrayDAO([
      "of": somepackage_Test.classInfo(),
    ])
    let t1 = somepackage_Test([
      "firstName": "Mike",
    ])
    XCTAssertEqual(t1, (try? dao.put(t1)) as? somepackage_Test)
    XCTAssertEqual(dao.array as! [somepackage_Test], [t1])
    XCTAssertEqual(t1, (try? dao.put(t1)) as? somepackage_Test)
    XCTAssertEqual(dao.array as! [somepackage_Test], [t1])

    let t2 = somepackage_Test([
      "firstName": "Mike",
    ])
    XCTAssertEqual(t2, (try? dao.put(t2)) as? somepackage_Test)
    XCTAssertEqual(dao.array as! [somepackage_Test], [t2])

    t1.firstName = "Mike2"
    XCTAssertEqual(t1, (try? dao.put(t1)) as? somepackage_Test)
    XCTAssertEqual(dao.array as! [somepackage_Test], [t2, t1])

    XCTAssertEqual(t1, (try? dao.find(t1.firstName)) as? somepackage_Test)

    let tToRemove = somepackage_Test(["firstName": "Mike2"])
    let tRemoved = (try? dao.remove(tToRemove)) as? somepackage_Test
    XCTAssertNotEqual(tRemoved, tToRemove)
    XCTAssertEqual(tRemoved, t1)

    let sink = (try? dao.select()) as! foam_dao_ArraySink
    XCTAssertEqual(sink.array as! [somepackage_Test], [t2])
  }


  func testDaoWhere() {
    let dao = foam_swift_dao_ArrayDAO([
      "of": somepackage_Test.classInfo(),
    ])
    let t1 = somepackage_Test([
      "firstName": "Joe1",
      "lastName": "Bob",
    ])
    let t2 = somepackage_Test([
      "firstName": "Joe2",
      "lastName": "Bob",
    ])
    try! _ = dao.put(t1)
    try! _ = dao.put(t2)

    do {
      let sink = foam_dao_ArraySink()
      _ = try! dao.`where`(foam_mlang_predicate_Eq(["arg1": somepackage_Test.LAST_NAME(), "arg2": foam_mlang_Constant(["value": "Bob"])])).select(sink)
      XCTAssertEqual(2, sink.array.count)
    }

    do {
      let sink = foam_dao_ArraySink()
      _ = try! dao.`where`(foam_mlang_predicate_Eq(["arg1": somepackage_Test.FIRST_NAME(), "arg2": foam_mlang_Constant(["value": "Joe2"])])).select(sink)
      XCTAssertEqual(1, sink.array.count)
      XCTAssertTrue(t2.isEqual(sink.array[0]))
    }
  }

  func testDaoListen() {
    let dao = foam_dao_ProxyDAO([
      "delegate": foam_swift_dao_ArrayDAO([
        "of": somepackage_Test.classInfo(),
      ])
    ])

    let sink = foam_mlang_sink_Count()
    let detach = (try? dao.listen(sink))

    _ = (try? dao.put(somepackage_Test(["firstName": "A"]))) as! somepackage_Test
    XCTAssertEqual(sink.value, 1)

    _ = (try? dao.put(somepackage_Test(["firstName": "B"]))) as! somepackage_Test
    XCTAssertEqual(sink.value, 2)

    _ = (try? dao.remove(somepackage_Test(["firstName": "B"]))) as! somepackage_Test
    XCTAssertEqual(sink.value, 1)

    detach?.detach()
    _ = (try? dao.put(somepackage_Test(["firstName": "C"])))
    XCTAssertEqual(sink.value, 1)
  }

  func testDaoSkipLimitSelect() {
    let dao = foam_swift_dao_ArrayDAO([
      "of": somepackage_Test.classInfo(),
    ])

    for i in 1...10 {
      _ = (try? dao.put(somepackage_Test(["firstName": i])))
    }

    let sink = (try? dao.skip(2).limit(5).select()) as! foam_dao_ArraySink
    XCTAssertEqual(sink.array.count, 5)
    XCTAssertEqual("3", (sink.array[0] as! somepackage_Test).firstName)
  }

  func testExpressionSlot() {
    let o = somepackage_Test()
    let slot = foam_swift_core_ExpressionSlot()
    slot.args = [o.firstName$, o.lastName$]
    slot.code = { args in
      return (args[0] as! String) + " " + (args[1] as! String)
    }

    o.firstName = "Mike"
    o.lastName = "C"
    XCTAssertEqual(slot.swiftGet() as! String, "Mike C")

    o.lastName = "D"
    XCTAssertEqual(slot.swiftGet() as! String, "Mike D")

    o.detach()
    slot.detach()
  }

  func testMemLeaks() {
    for _ in 1...5 {
      testFollow()
      testListen()
      testExpression()
      testExpressionSlot()
      testSubSlot()
      testSubSlot2()
      testClientBoxRegistry()
    }
  }

  func testHasOwnProperty() {
    let o = somepackage_Test()
    o.firstName = "Mike"
    o.lastName = "C"
    XCTAssertEqual(o.exprProp, "Mike C")
    XCTAssertFalse(o.hasOwnProperty("exprProp"))
  }

  func testSwiftSubFire() {
    let o = somepackage_Test()

    var calls = 0
    let sub = o.firstName$.swiftSub { (_, _) in
      calls += 1
    }

    XCTAssertEqual(calls, 0)
    o.firstName = "YOO"
    XCTAssertEqual(calls, 1)

    sub.detach()
  }

  func testSubSlot() {
    let t = somepackage_Test()
    let t2 = somepackage_Test()
    t2.firstName = "YO"
    t.anyProp = t2

    let s = t.anyProp$.dot("firstName")
    XCTAssertEqual(s.swiftGet() as? String, "YO")

    var i = 0
    _ = s.swiftSub { (_, _) in
      i += 1
      XCTAssertEqual(s.swiftGet() as? String, "YO2")
    }
    t2.firstName = "YO2"
    XCTAssertEqual(s.swiftGet() as? String, "YO2")
    XCTAssertEqual(i, 1)
  }

  func testSubSlot2() {
    let t = somepackage_Test(["firstName": "a"])

    var slot = 0
    let s1 = t.firstName$.swiftSub { (_, _) in
      slot += 1
    }

    var subSlot = 0
    let t2 = somepackage_Test(["anyProp": t])
    let s2 = t2.anyProp$.dot("firstName").swiftSub { (_, _) in
      subSlot += 1
    }

    XCTAssertEqual(t2.anyProp$.dot("firstName").swiftGet() as! String, "a")
    XCTAssertEqual(slot, 0)
    XCTAssertEqual(subSlot, 0)

    t.firstName = "B"

    XCTAssertEqual(t2.anyProp$.dot("firstName").swiftGet() as! String, "B")
    XCTAssertEqual(slot, 1)
    XCTAssertEqual(subSlot, 1)

    s1.detach()
    s2.detach()
    t.detach()
    t2.detach()
  }

  func testRPCBoxSuccess() {
    let rpcBox = foam_box_RPCReturnBox()

    let sem = DispatchSemaphore(value: 0)

    var dispatched = false
    DispatchQueue(label: "TestDispatch").async {
      let msg = try? rpcBox.promise.get() as! String
      dispatched = true
      XCTAssertEqual(msg, "Hello there")
      sem.signal()
    }

    let msg = foam_box_Message(["object": foam_box_RPCReturnMessage(["data": "Hello there"])])
    XCTAssertFalse(dispatched)
    try! rpcBox.send(msg)
    sem.wait()
    XCTAssertTrue(dispatched)
  }

  func testRPCBoxError() {
    let rpcBox = foam_box_RPCReturnBox()

    let sem = DispatchSemaphore(value: 0)

    var dispatched = false
    DispatchQueue(label: "TestDispatch").async {
      do {
        _ = try rpcBox.promise.get() as! String
      } catch let e {
        let e = e as! FoamError
        dispatched = true
        XCTAssertEqual(e.obj as? String, "Hello there")
        sem.signal()
      }
    }

    let msg = foam_box_Message(["object": "Hello there"])
    XCTAssertFalse(dispatched)
    try! rpcBox.send(msg)
    sem.wait()
    XCTAssertTrue(dispatched)
  }

  func testClientBoxRegistry() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let outputter = X.create(foam_swift_parse_json_output_Outputter.self)!
    let parser = X.create(foam_swift_parse_json_FObjectParser.self)!

    class somepackage_TestBox: foam_box_Box {
      var o: Any?
      func send(_ msg: foam_box_Message) throws {
        o = msg.object
      }
    }
    let testBox = somepackage_TestBox()
    let registeredBox =
        (boxContext.registry as! foam_box_BoxRegistryBox).register("TestBox", nil, testBox) as? foam_box_SubBox

    _ = (boxContext.registry as! foam_box_BoxRegistryBox).register("", nil, boxContext.registry as! foam_box_BoxRegistryBox) as? foam_box_SubBox
    boxContext.root = boxContext.registry

    class RegistryDelegate: foam_box_Box {
      var outputter: foam_swift_parse_json_output_Outputter
      var parser: foam_swift_parse_json_FObjectParser
      var registry: foam_box_Box
      init(registry: foam_box_Box, outputter: foam_swift_parse_json_output_Outputter, parser: foam_swift_parse_json_FObjectParser) {
        self.registry = registry
        self.outputter = outputter
        self.parser = parser
      }
      func send(_ msg: foam_box_Message) throws {
        let reply = msg.attributes["replyBox"] as? foam_box_Box

        let str = outputter.swiftStringify(msg)
        let obj = parser.parseString(str) as! foam_box_Message
        obj.attributes["replyBox"] = reply

        try registry.send(obj)
      }
    }

    let clientBoxRegistry = foam_box_ClientBoxRegistry(X: X)
    clientBoxRegistry.delegate =
        RegistryDelegate(registry: boxContext.registry!, outputter: outputter, parser: parser)

    do {
      let box = try clientBoxRegistry.doLookup("TestBox") as? foam_box_SubBox
      XCTAssertNotNil(box)
      XCTAssertTrue(registeredBox === box)
      try? box?.send(foam_box_Message(["object": "HELLO"]))
      XCTAssertEqual(testBox.o as? String, "HELLO")
    } catch {
      fatalError()
    }
  }
  func testAPar() {
    let complete = Future<Any?>()

    let lock = DispatchSemaphore(value: 0)
    var secondBeforeFirst = false
    Async.aPar([
      { ret, _, _ in
        DispatchQueue.global(qos: .utility).async {
          lock.wait()
          XCTAssertTrue(secondBeforeFirst)
          ret("A")
        }
      },
      { ret, _, _ in
        DispatchQueue.global(qos: .userInitiated).async {
          secondBeforeFirst = true
          lock.signal()
          ret("B")
        }
      },
      { ret, _, _ in
        DispatchQueue.global(qos: .background).async {
          ret("C")
        }
      },
    ])({ r in
      complete.set((r as! [String]).joined())
    }, { _ in }, nil)

    try! XCTAssertEqual(complete.get() as! String, "ABC")
  }

  func testASeq() {
    let x = Context.GLOBAL
    let dao = x.create(foam_swift_dao_ArrayDAO.self, args: [
      "of": somepackage_Test.classInfo(),
    ])!

    let complete = Future<Any?>()

    Async.aSeq([
      { ret, _, name in
        DispatchQueue.global(qos: .utility).async {
          try? ret(dao.put(x.create(somepackage_Test.self, args: ["firstName": name])!)!)
        }
      },
      { ret, _, t in
        XCTAssertEqual((t as! somepackage_Test).firstName, "joe")
        DispatchQueue.global(qos: .userInteractive).async {
          try? ret(dao.select(foam_mlang_sink_Count()))
        }
      },
      { ret, _, sink in
        let sink = sink as! foam_mlang_sink_Count
        XCTAssertEqual(sink.value, 1)
        ret(sink.value)
      },
    ])({ r in
      complete.set(r)
    }, { _ in }, "joe")

    try! XCTAssertEqual(complete.get() as! Int, 1)
  }

  func testASeqErr() {
    let complete = Future<Bool>()
    Async.aSeq([
      { _, aThrow, _ in
        DispatchQueue.global(qos: .utility).async {
          aThrow(nil)
        }
      },
      { ret, _, t in
        XCTFail()
        ret(nil)
      },
    ])({ _ in
      complete.set(false)
    }, { _ in
      complete.set(true)
    }, nil)

    try! XCTAssertEqual(complete.get(), true)
  }

  func testCopyFrom() {
    let x = Context.GLOBAL
    let t1 = x.create(somepackage_Test.self)!
    let t2 = x.create(somepackage_Test.self)!

    XCTAssertTrue(t1.isEqual(t2))

    t1.firstName = "a"
    XCTAssertFalse(t1.isEqual(t2))

    t2.copyFrom(t1)
    XCTAssertTrue(t1.isEqual(t2))
    XCTAssertEqual(t2.firstName, "a")
  }

  func testPromisedDAO() {
    let dao = x.create(foam_swift_dao_ArrayDAO.self, args: ["of": somepackage_Test.classInfo()])!
    let pDao = x.create(foam_dao_PromisedDAO.self)!

    DispatchQueue.global(qos: .background).async {
      _ = try? dao.put(self.x.create(somepackage_Test.self, args: ["firstName": "A"])!)
      _ = try? dao.put(self.x.create(somepackage_Test.self, args: ["firstName": "B"])!)
      pDao.promise.set(dao)
    }

    let a = try? pDao.select() as! foam_dao_ArraySink
    XCTAssertEqual(a?.array.count, 2)
  }

  func testCachingSlowDAO() {
    let numItems = 50

    var src: foam_dao_DAO = x.create(foam_swift_dao_ArrayDAO.self, args: ["of": somepackage_Test.classInfo()])!
    for i in 0..<numItems {
      _ = try! src.put(x.create(somepackage_Test.self, args: ["firstName": i])!)
    }
    src = x.create(foam_dao_SlowDAO.self, args: [
      "delegate": src,
      "delayMs": 1000,
    ])!

    let dao = x.create(foam_swift_dao_CachingDAO.self, args: [
      "cache": x.create(foam_swift_dao_ArrayDAO.self, args: ["of": somepackage_Test.classInfo()])!,
      "src": src,
    ])!

    measure {
      for i in 0..<numItems {
        try! XCTAssertNotNil(dao.find(String(i)))
      }
    }
  }

  func testCachingDAO() {
    let src = x.create(foam_dao_SlowDAO.self, args: [
      "delegate": x.create(foam_swift_dao_ArrayDAO.self, args: ["of": somepackage_Test.classInfo()])!,
      "delayMs": 1000,
    ])!

    let cache = x.create(foam_swift_dao_ArrayDAO.self, args: ["of": somepackage_Test.classInfo()])!

    let dao = x.create(foam_swift_dao_CachingDAO.self, args: [
      "cache": cache,
      "src": src,
    ])!

    _ = try? dao.put(x.create(somepackage_Test.self, args: ["firstName": "1"])!)

    try XCTAssertEqual((dao.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 1)
    try XCTAssertEqual((src.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 1)
    try XCTAssertEqual((cache.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 1)

    _ = try? src.put(x.create(somepackage_Test.self, args: ["firstName": "2"])!)

    try XCTAssertEqual((dao.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 2)
    try XCTAssertEqual((src.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 2)
    try XCTAssertEqual((cache.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 2)

    _ = try? cache.put(x.create(somepackage_Test.self, args: ["firstName": "3"])!)

    try XCTAssertEqual((dao.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 3)
    try XCTAssertEqual((src.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 2)
    try XCTAssertEqual((cache.select(x.create(foam_mlang_sink_Count.self)!) as? foam_mlang_sink_Count)?.value, 3)
  }

  func testDateProp() {
    let t = x.create(somepackage_Test.self)!

    t.set(key: "dateProp", value: 123456)
    XCTAssertEqual(t.dateProp, Date(timeIntervalSince1970: 123456))

    t.set(key: "dateProp", value: "2017-11-20T19:00:00.0Z")
    XCTAssertEqual(t.dateProp, Date(timeIntervalSince1970: 1511222400))

    t.set(key: "dateProp", value: Date(timeIntervalSince1970: 1234))
    XCTAssertEqual(t.dateProp, Date(timeIntervalSince1970: 1234))
  }

  func testInstanceOf() {
    let o = x.create(somepackage_Test.self)!
    XCTAssertTrue(somepackage_Test.classInfo().instanceOf(o))
  }
}
