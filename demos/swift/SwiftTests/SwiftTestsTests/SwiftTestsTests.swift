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
    let o1 = Test(["firstName": "A"])
    let o2 = Test(["firstName$": o1.firstName$])
    XCTAssertEqual(o2.firstName, "A")
    o2.firstName = "B"
    XCTAssertEqual(o1.firstName, "B")
    o1.detach()
    o2.detach()
  }

  func testObjectCreationPerformance() {
    self.measure {
      for _ in 1...1000 {
        _ = Test()
      }
    }
  }

  func testFObjectParse() {
    let ps = FObjectParser().parseString("{class:'somepackage.Test', prevFirstName: \"MY_PREV_NAME\",\"enumProp\":{class:\"foam.u2.Visibility\",ordinal:1}}")
    XCTAssertTrue(ps is Test)
    XCTAssertEqual((ps as! Test).prevFirstName, "MY_PREV_NAME")
    XCTAssertEqual((ps as! Test).enumProp, Visibility.FINAL)
  }

  func testToJSON() {
    let t = Test()
    t.prevFirstName = "MY_PREV_NAME"
    t.boolProp = false
    t.intProp = 34
    t.enumProp = Visibility.FINAL // Outputs as just the ordinal
    t.anyProp = Visibility.FINAL // Outputs as the full fobject
    XCTAssertEqual(Outputter().swiftStringify(t),
    "{\"class\":\"somepackage.Test\",\"anyProp\":{\"class\":\"foam.u2.Visibility\",\"ordinal\":1},\"intProp\":34,\"boolProp\":false,\"prevFirstName\":\"MY_PREV_NAME\",\"enumProp\":1}")
  }

  func testExpression() {
    let t = Test()
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
    let t1 = Test()
    let t2 = Test()
    XCTAssertEqual(t1.compareTo(t2), 0)
    t1.firstName = "NOT T2"
    XCTAssertEqual(t1.compareTo(t2), 1)
    t2.firstName = "NOT T2"
    XCTAssertEqual(t1.compareTo(t2), 0)
    t1.clearProperty("firstName")
    XCTAssertEqual(t1.compareTo(t2), -1)
  }

  func testArrayDao() {
    let dao = ArrayDAO([
      "of": Test.classInfo(),
    ])
    let t1 = Test([
      "firstName": "Mike",
    ])
    XCTAssertEqual(t1, (try? dao.put(t1)) as? Test)
    XCTAssertEqual(dao.array as! [Test], [t1])
    XCTAssertEqual(t1, (try? dao.put(t1)) as? Test)
    XCTAssertEqual(dao.array as! [Test], [t1])

    let t2 = Test([
      "firstName": "Mike",
    ])
    XCTAssertEqual(t2, (try? dao.put(t2)) as? Test)
    XCTAssertEqual(dao.array as! [Test], [t2])

    t1.firstName = "Mike2"
    XCTAssertEqual(t1, (try? dao.put(t1)) as? Test)
    XCTAssertEqual(dao.array as! [Test], [t2, t1])

    XCTAssertEqual(t1, (try? dao.find(t1.firstName)) as? Test)

    let tToRemove = Test(["firstName": "Mike2"])
    let tRemoved = (try? dao.remove(tToRemove)) as? Test
    XCTAssertNotEqual(tRemoved, tToRemove)
    XCTAssertEqual(tRemoved, t1)

    let sink = (try? dao.select()) as! ArraySink
    XCTAssertEqual(sink.array as! [Test], [t2])
  }


  func testDaoWhere() {
    let dao = ArrayDAO([
      "of": Test.classInfo(),
    ])
    let t1 = Test([
      "firstName": "Joe1",
      "lastName": "Bob",
    ])
    let t2 = Test([
      "firstName": "Joe2",
      "lastName": "Bob",
    ])
    try! _ = dao.put(t1)
    try! _ = dao.put(t2)

    do {
      let sink = ArraySink()
      _ = try! dao.`where`(Eq(["arg1": Test.LAST_NAME(), "arg2": Constant(["value": "Bob"])])).select(sink)
      XCTAssertEqual(2, sink.array.count)
    }

    do {
      let sink = ArraySink()
      _ = try! dao.`where`(Eq(["arg1": Test.FIRST_NAME(), "arg2": Constant(["value": "Joe2"])])).select(sink)
      XCTAssertEqual(1, sink.array.count)
      XCTAssertTrue(t2.isEqual(sink.array[0]))
    }
  }

  func testDaoListen() {
    let dao = ProxyDAO([
      "delegate": ArrayDAO([
        "of": Test.classInfo(),
      ])
    ])

    let sink = Count()
    let detach = (try? dao.listen(sink))

    _ = (try? dao.put(Test(["firstName": "A"]))) as! Test
    XCTAssertEqual(sink.value, 1)

    _ = (try? dao.put(Test(["firstName": "B"]))) as! Test
    XCTAssertEqual(sink.value, 2)

    _ = (try? dao.remove(Test(["firstName": "B"]))) as! Test
    XCTAssertEqual(sink.value, 1)

    detach?.detach()
    _ = (try? dao.put(Test(["firstName": "C"])))
    XCTAssertEqual(sink.value, 1)
  }

  func testDaoSkipLimitSelect() {
    let dao = ArrayDAO([
      "of": Test.classInfo(),
    ])

    for i in 1...10 {
      _ = (try? dao.put(Test(["firstName": i])))
    }

    let sink = (try? dao.skip(2).limit(5).select()) as! ArraySink
    XCTAssertEqual(sink.array.count, 5)
    XCTAssertEqual("3", (sink.array[0] as! Test).firstName)
  }

  func testExpressionSlot() {
    let o = Test()
    let slot = ExpressionSlot()
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
    let o = Test()
    o.firstName = "Mike"
    o.lastName = "C"
    XCTAssertEqual(o.exprProp, "Mike C")
    XCTAssertFalse(o.hasOwnProperty("exprProp"))
  }

  func testSwiftSubFire() {
    let o = Test()

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
    let t = Test()
    let t2 = Test()
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
    let t = Test(["firstName": "a"])

    var slot = 0
    let s1 = t.firstName$.swiftSub { (_, _) in
      slot += 1
    }

    var subSlot = 0
    let t2 = Test(["anyProp": t])
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
    let rpcBox = RPCReturnBox()

    let sem = DispatchSemaphore(value: 0)

    var dispatched = false
    DispatchQueue(label: "TestDispatch").async {
      let msg = try? rpcBox.future.get() as! String
      dispatched = true
      XCTAssertEqual(msg, "Hello there")
      sem.signal()
    }

    let msg = Message(["object": RPCReturnMessage(["data": "Hello there"])])
    XCTAssertFalse(dispatched)
    try! rpcBox.send(msg)
    sem.wait()
    XCTAssertTrue(dispatched)
  }

  func testRPCBoxError() {
    let rpcBox = RPCReturnBox()

    let sem = DispatchSemaphore(value: 0)

    var dispatched = false
    DispatchQueue(label: "TestDispatch").async {
      do {
        _ = try rpcBox.future.get() as! String
      } catch let e {
        let e = e as! FoamError
        dispatched = true
        XCTAssertEqual(e.obj as? String, "Hello there")
        sem.signal()
      }
    }

    let msg = Message(["object": "Hello there"])
    XCTAssertFalse(dispatched)
    try! rpcBox.send(msg)
    sem.wait()
    XCTAssertTrue(dispatched)
  }

  func testClientBoxRegistry() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let outputter = X.create(Outputter.self)!
    let parser = X.create(FObjectParser.self)!

    class TestBox: Box {
      var o: Any?
      func send(_ msg: Message) throws {
        o = msg.object
      }
    }
    let testBox = TestBox()
    let registeredBox =
        (boxContext.registry as! BoxRegistryBox).register("TestBox", nil, testBox) as? SubBox

    _ = (boxContext.registry as! BoxRegistryBox).register("", nil, boxContext.registry as! BoxRegistryBox) as? SubBox
    boxContext.root = boxContext.registry

    class RegistryDelegate: Box {
      var outputter: Outputter
      var parser: FObjectParser
      var registry: Box
      init(registry: Box, outputter: Outputter, parser: FObjectParser) {
        self.registry = registry
        self.outputter = outputter
        self.parser = parser
      }
      func send(_ msg: Message) throws {
        let reply = msg.attributes["replyBox"] as? Box

        let str = outputter.swiftStringify(msg)
        let obj = parser.parseString(str) as! Message
        obj.attributes["replyBox"] = reply

        try registry.send(obj)
      }
    }

    let clientBoxRegistry = ClientBoxRegistry(X: X)
    clientBoxRegistry.delegate =
        RegistryDelegate(registry: boxContext.registry!, outputter: outputter, parser: parser)

    do {
      let box = try clientBoxRegistry.doLookup("TestBox") as? SubBox
      XCTAssertNotNil(box)
      XCTAssertTrue(registeredBox === box)
      try? box?.send(Message(["object": "HELLO"]))
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
    let dao = x.create(ArrayDAO.self, args: [
      "of": Test.classInfo(),
    ])!

    let complete = Future<Any?>()

    Async.aSeq([
      { ret, _, name in
        DispatchQueue.global(qos: .utility).async {
          try? ret(dao.put(x.create(Test.self, args: ["firstName": name])!)!)
        }
      },
      { ret, _, t in
        XCTAssertEqual((t as! Test).firstName, "joe")
        DispatchQueue.global(qos: .userInteractive).async {
          try? ret(dao.select(Count()))
        }
      },
      { ret, _, sink in
        let sink = sink as! Count
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
    let t1 = x.create(Test.self)!
    let t2 = x.create(Test.self)!

    XCTAssertTrue(t1.isEqual(t2))

    t1.firstName = "a"
    XCTAssertFalse(t1.isEqual(t2))

    t2.copyFrom(t1)
    XCTAssertTrue(t1.isEqual(t2))
    XCTAssertEqual(t2.firstName, "a")
  }

  func testPromisedDAO() {
    let dao = x.create(ArrayDAO.self, args: ["of": Test.classInfo()])!
    let pDao = x.create(PromisedDAO.self)!

    DispatchQueue.global(qos: .background).async {
      _ = try? dao.put(self.x.create(Test.self, args: ["firstName": "A"])!)
      _ = try? dao.put(self.x.create(Test.self, args: ["firstName": "B"])!)
      pDao.promise.set(dao)
    }

    let a = try? pDao.select() as! ArraySink
    XCTAssertEqual(a?.array.count, 2)
  }

  func testCachingSlowDAO() {
    let numItems = 50

    var src: DAO = x.create(ArrayDAO.self, args: ["of": Test.classInfo()])!
    for i in 0..<numItems {
      _ = try! src.put(x.create(Test.self, args: ["firstName": i])!)
    }
    src = x.create(SlowDAO.self, args: [
      "delegate": src,
      "delayMs": 1000,
    ])!

    let dao = x.create(CachingDAO.self, args: [
      "cache": x.create(ArrayDAO.self, args: ["of": Test.classInfo()])!,
      "src": src,
    ])!

    measure {
      for i in 0..<numItems {
        try! XCTAssertNotNil(dao.find(String(i)))
      }
    }
  }

  func testCachingDAO() {
    let src = x.create(SlowDAO.self, args: [
      "delegate": x.create(ArrayDAO.self, args: ["of": Test.classInfo()])!,
      "delayMs": 1000,
    ])!

    let cache = x.create(ArrayDAO.self, args: ["of": Test.classInfo()])!

    let dao = x.create(CachingDAO.self, args: [
      "cache": cache,
      "src": src,
    ])!

    _ = try? dao.put(x.create(Test.self, args: ["firstName": "1"])!)

    try XCTAssertEqual((dao.select(x.create(Count.self)!) as? Count)?.value, 1)
    try XCTAssertEqual((src.select(x.create(Count.self)!) as? Count)?.value, 1)
    try XCTAssertEqual((cache.select(x.create(Count.self)!) as? Count)?.value, 1)

    _ = try? src.put(x.create(Test.self, args: ["firstName": "2"])!)

    try XCTAssertEqual((dao.select(x.create(Count.self)!) as? Count)?.value, 2)
    try XCTAssertEqual((src.select(x.create(Count.self)!) as? Count)?.value, 2)
    try XCTAssertEqual((cache.select(x.create(Count.self)!) as? Count)?.value, 2)

    _ = try? cache.put(x.create(Test.self, args: ["firstName": "3"])!)

    try XCTAssertEqual((dao.select(x.create(Count.self)!) as? Count)?.value, 3)
    try XCTAssertEqual((src.select(x.create(Count.self)!) as? Count)?.value, 2)
    try XCTAssertEqual((cache.select(x.create(Count.self)!) as? Count)?.value, 3)
  }

  func testDateProp() {
    let t = x.create(Test.self)!

    t.set(key: "dateProp", value: 123456)
    XCTAssertEqual(t.dateProp, Date(timeIntervalSince1970: 123456))

    t.set(key: "dateProp", value: "2017-11-20T19:00:00.0Z")
    XCTAssertEqual(t.dateProp, Date(timeIntervalSince1970: 1511222400))

    t.set(key: "dateProp", value: Date(timeIntervalSince1970: 1234))
    XCTAssertEqual(t.dateProp, Date(timeIntervalSince1970: 1234))
  }
}
