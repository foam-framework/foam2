/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import Foundation

public typealias Listener = (Subscription, [Any?]) -> Void
public typealias MethodSlotClosure = ([Any?]) throws -> Any?

public protocol ContextAware {
  var __context__: Context { get set }
  var __subContext__: Context { get }
}

public protocol Axiom {
  var name: String { get }
}

class ListenerList {
  var next: ListenerList?
  var prev: ListenerList?
  lazy var children: [String:ListenerList] = [:]
  var listener: Listener?
  var sub: Subscription?
}

public protocol PropertyInfo: Axiom {
  var classInfo: ClassInfo { get }
  var transient: Bool { get }
  var label: String { get }
  var visibility: Visibility { get }
  var jsonParser: Parser? { get }
  func set(_ obj: FObject, value: Any?)
  func get(_ obj: FObject) -> Any? // TODO rename to f?
  func compareValues(_ v1: Any?, _ v2: Any?) -> Int
  func viewFactory(x: Context) -> FObject?
}

extension PropertyInfo {
  public func toJSON(outputter: Outputter, out: inout String, value: Any?) {
    outputter.output(&out, value)
  }
  public func compare(_ o1: FObject, _ o2: FObject) -> Int {
    let v1 = get(o1) as AnyObject?
    let v2 = get(o2) as AnyObject?
    if v1 === v2 { return 0 }
    if v1 == nil && v2 == nil { return 0 }
    if v1 == nil { return -1 }
    if v2 == nil { return 1 }
    return compareValues(v1, v2)
  }
}

public class MethodArg {
  public var name: String = ""
}

public protocol MethodInfo: Axiom {
  var args: [MethodArg] { get }
}
extension MethodInfo {
  public func call(_ obj: FObject, args: [Any?] = []) throws -> Any? {
    let callback = obj.getSlot(key: name)!.swiftGet() as! ([Any?]) throws -> Any?
    return try callback(args)
  }
}

public protocol ActionInfo: MethodInfo {
  var label: String { get }
}

public class Context {
  public static let GLOBAL: Context = {
    let x = Context()
    FOAM_utils.registerClasses(x)
    return x
  }()
  var parent: Context?

  private lazy var classIdMap: [String:ClassInfo] = [:]
  private lazy var classNameMap: [String:String] = [:]
  public func registerClass(cls: ClassInfo) {
    classIdMap[cls.id] = cls
    classNameMap[NSStringFromClass(cls.cls)] = cls.id
    _ = cls.ownAxioms
  }
  public func lookup(_ id: String) -> ClassInfo? {
    return classIdMap[id] ?? parent?.lookup(id)
  }
  func lookup_(_ cls: AnyClass) -> ClassInfo? {
    let str = NSStringFromClass(cls)
    if let id = classNameMap[str] {
      return lookup(id)
    }
    return parent?.lookup_(cls)
  }

  public func create<T>(_ type: T.Type, args: [String:Any?] = [:]) -> T? {
    if let type = type as? AnyClass,
       let cls = lookup_(type) {
      return cls.create(args: args, x: self) as? T
    }
    return nil
  }

  private var slotMap: [String:Slot] = [:]
  public subscript(key: String) -> Any? {
    if let slot = slotMap[key] {
      return slot
    } else if let slot = slotMap[toSlotName(name: key)] {
      return slot.swiftGet()
    }
    return parent?[key]
  }
  private func toSlotName(name: String) -> String { return name + "$" }
  public func createSubContext(args: [String:Any?] = [:]) -> Context {
    var slotMap: [String:Slot] = [:]
    for (key, value) in args {
      let slotName = toSlotName(name: key)
      if let slot = value as AnyObject as? Slot {
        slotMap[slotName] = slot
      } else {
        slotMap[slotName] = ConstantSlot(["value": value])
      }
    }
    let subContext = Context()
    subContext.slotMap = slotMap
    subContext.parent = self
    return subContext
  }
}

public protocol ClassInfo {
  var id: String { get }
  var label: String { get }
  var parent: ClassInfo? { get }
  var ownAxioms: [Axiom] { get }
  var cls: AnyClass { get }
  func create(args: [String:Any?], x: Context) -> Any
}

extension ClassInfo {
  var axioms: [Axiom] {
    get {
      var curCls: ClassInfo? = self
      var axioms: [Axiom] = []
      var seen = Set<String>()
      while curCls != nil {
        for a in curCls!.ownAxioms {
          if seen.contains(a.name) { continue }
          axioms.append(a)
          seen.insert(a.name)
        }
        curCls = curCls!.parent
      }
      return axioms
    }
  }
  func ownAxioms<T>(byType type: T.Type) -> [T] {
    var axs: [T] = []
    for axiom in ownAxioms {
      if let axiom = axiom as? T {
        axs.append(axiom)
      }
    }
    return axs
  }
  func axioms<T>(byType type: T.Type) -> [T] {
    var axs: [T] = []
    for axiom in axioms {
      if let axiom = axiom as? T {
        axs.append(axiom)
      }
    }
    return axs
  }
  func axiom(byName name: String) -> Axiom? {
    for axiom in axioms {
      if axiom.name == name { return axiom }
    }
    return nil
  }
  func create(x: Context) -> Any { return create(args: [:], x: x) }
}

public protocol Detachable {
  func detach()
}

public class Subscription: Detachable {
  private var detach_: (() -> Void)?
  init(detach: @escaping () ->Void) {
    self.detach_ = detach
  }
  public func detach() {
    detach_?()
    detach_ = nil
  }
}

public protocol FObject: class, Detachable {
  func ownClassInfo() -> ClassInfo
  func sub(topics: [String], listener l: @escaping Listener) -> Subscription
  func set(key: String, value: Any?)
  func get(key: String) -> Any?
  func getSlot(key: String) -> Slot?
  func hasOwnProperty(_ key: String) -> Bool
  func clearProperty(_ key: String)
  func compareTo(_ data: FObject?) -> Int
  func onDetach(_ sub: Detachable)
  func toString() -> String
  init(_ args: [String:Any?])
}

public class AbstractFObject: NSObject, FObject, ContextAware {

  public var __context__: Context = Context.GLOBAL
  private var ___subContext___: Context!
  public var __subContext__: Context { get { return self.___subContext___ } }

  func _createExports_() -> [String:Any?] { return [:] }

  lazy var listeners: ListenerList = ListenerList()

  public class func classInfo() -> ClassInfo { fatalError() }
  public func ownClassInfo() -> ClassInfo { fatalError() }

  public func set(key: String, value: Any?) {}
  public func get(key: String) -> Any? { return nil }
  public func getSlot(key: String) -> Slot? { return nil }
  public func hasOwnProperty(_ key: String) -> Bool { return false }
  public func clearProperty(_ key: String) {}

  public func onDetach(_ sub: Detachable) {
    _ = self.sub(topics: ["detach"]) { (s, _) in
      s.detach()
      sub.detach()
    }
  }

  public func detach() {
    _ = pub(["detach"])
    detachListeners(listeners: listeners)
  }

  public func sub(
    topics: [String] = [],
    listener l: @escaping Listener) -> Subscription {

    var listeners = self.listeners
    for topic in topics {
      if listeners.children[topic] == nil {
        listeners.children[topic] = ListenerList()
      }
      listeners = listeners.children[topic]!
    }

    let node = ListenerList()
    node.next = listeners.next
    node.prev = listeners
    node.listener = l
    node.sub = Subscription(detach: {
      node.next?.prev = node.prev
      node.prev?.next = node.next
      node.listener = nil
      node.next = nil
      node.prev = nil
      node.sub = nil
    })

    listeners.next?.prev = node
    listeners.next = node

    return node.sub!
  }

  func hasListeners(_ args: [Any]) -> Bool {
    var listeners: ListenerList? = self.listeners
    var i = 0
    while listeners != nil {
      if listeners?.next != nil { return true }
      if i == args.count { return false }
      if let p = args[i] as? String {
        listeners = listeners?.children[p]
        i += 1
      } else {
        break
      }
    }
    return false
  }

  private func notify(listeners: ListenerList?, args: [Any]) -> Int {
    var count = 0
    var l = listeners
    while l != nil {
      let listener = l!.listener!
      let sub = l!.sub!
      l = l!.next
      listener(sub, args)
      count += 1
    }
    return count
  }

  public func pub(_ args: [Any]) -> Int {
    var listeners: ListenerList = self.listeners
    var count = notify(listeners: listeners.next, args: args)
    for arg in args {
      guard let key = arg as? String else { break }
      if listeners.children[key] == nil { break }
      listeners = listeners.children[key]!
      count += notify(listeners: listeners.next, args: args)
    }
    return count
  }

  public func compareTo(_ data: FObject?) -> Int {
    if self === data { return 0 }
    if data == nil { return 1 }
    let data = data!
    if ownClassInfo().id != data.ownClassInfo().id {
      return ownClassInfo().id > data.ownClassInfo().id ? 1 : -1
    }
    for props in data.ownClassInfo().axioms(byType: PropertyInfo.self) {
      let diff = props.compare(self, data)
      if diff != 0 { return diff }
    }
    return 0
  }

  public override required init() {
    super.init()
    ___subContext___ = __context__.createSubContext(args: self._createExports_())
    __foamInit__()
  }

  public required init(_ args: [String:Any?]) {
    super.init()
    ___subContext___ = __context__.createSubContext(args: self._createExports_())
    for (key, value) in args {
      self.set(key: key, value: value)
    }
    __foamInit__()
  }

  public required init(X x: Context) {
    super.init()
    __context__ = x
    ___subContext___ = __context__.createSubContext(args: self._createExports_())
    __foamInit__()
  }

  public required init(_ args: [String:Any?], _ x: Context) {
    super.init()
    __context__ = x
    ___subContext___ = __context__.createSubContext(args: self._createExports_())
    for (key, value) in args {
      self.set(key: key, value: value)
    }
    __foamInit__()
  }

  func __foamInit__() {}

  private func detachListeners(listeners: ListenerList?) {
    var l = listeners
    while l != nil {
      l!.sub?.detach()
      for child in l!.children.values {
        detachListeners(listeners: child)
      }
      l = l!.next
    }
  }

  deinit {
    detach()
  }

  public func toString() -> String {
    return __context__.create(Outputter.self)!.swiftStringify(self)
  }
}

struct FOAM_utils {
  public static func equals(_ o1: Any?, _ o2: Any?) -> Bool {
    let a = o1 as AnyObject?
    let b = o2 as AnyObject?
    if a === b { return true }
    if a != nil { return a!.isEqual(b) }
    return false
  }
  static var nextId = 1
  static var nextIdSem = DispatchSemaphore(value: 1)
  static func next$UID() -> Int {
    nextIdSem.wait()
    let id = nextId
    nextId += 1
    nextIdSem.signal()
    return id
  }
}
public class Reference<T> {
  var value: T
  init(value: T) { self.value = value }
}

extension String {
  func char(at: Int) -> Character {
    return self[index(startIndex, offsetBy: at)]
  }
  func index(of: Character) -> Int {
    if let r = range(of: of.description) {
      return distance(from: startIndex, to: r.lowerBound)
    }
    return -1
  }
}

extension Character {
  func isDigit() -> Bool {
    return "0"..."9" ~= self
  }
}

public class ModelParserFactory {
  private static var parsers: [String:Parser] = [:]
  public static func getInstance(_ cls: ClassInfo) -> Parser {
    if let p = parsers[cls.id] { return p }
    let parser = buildInstance(cls)
    parsers[cls.id] = parser
    return parser
  }
  private static func buildInstance(_ info: ClassInfo) -> Parser {
    var parsers = [Parser]()
    for p in info.axioms(byType: PropertyInfo.self) {
      if p.jsonParser != nil {
        parsers.append(PropertyParser(["property": p]))
      }
    }
    return Repeat0([
      "delegate": Seq0(["parsers": [
        Whitespace(),
        Alt(["parsers": parsers])
      ]]),
      "delim": Literal(["string": ","]),
    ])
  }
}

public protocol FOAM_enum {
  var ordinal: Int { get }
  var name: String { get }
  var label: String { get }
}

public class FoamError: Error {
  var obj: Any?
  init(_ obj: Any?) { self.obj = obj }
  func toString() -> String {
    if let obj = self.obj as? FObject {
      let o = Context.GLOBAL.create(Outputter.self)!
      return o.swiftStringify(obj)
    } else if let obj = self.obj as? FoamError {
      return "FoamError(" + obj.toString() + ")"
    }
    return String(describing: self.obj as AnyObject)
  }
}

public typealias AFunc = (@escaping (Any?) -> Void, Any?) -> Void
public struct Async {

  public static func aPar(_ funcs: [AFunc]) -> AFunc {
    return { (ret: @escaping (Any?) -> Void, args: Any?) in
      var numCompleted = 0
      var returnValues = Array<Any?>(repeating: nil, count: funcs.count)
      for i in 0...funcs.count-1 {
        returnValues[i] = 0
        let f = funcs[i]
        f({ data in
          if let data = data as Any? {
            returnValues[i] = data
          }
          numCompleted += 1
          if numCompleted == funcs.count {
            ret(returnValues)
          }
        }, args)
      }
    }
  }

  public static func aSeq(_ funcs: [AFunc]) -> AFunc {
    return { (ret: @escaping (Any?) -> Void, args: Any?) in
      var i = 0
      var next: ((Any?) -> Void)!
      next = { d in
        let f = funcs[i]
        f({ d2 in
          i += 1
          if i == funcs.count {
            ret(d2)
          } else {
            next(d2)
          }
        }, d)
      }
      next(args)
    }
  }

  public static func aWhile(_ cond: @escaping () -> Bool, afunc: @escaping AFunc) -> AFunc {
    return { (ret: @escaping (Any?) -> Void, args: Any?) in
      var next: ((Any?) -> Void)!
      next = { d in
        if !cond() {
          ret(args)
          return
        }
        afunc(next, args)
      }
      next(args)
    }
  }

  public static func aWait(delay: TimeInterval = 0,
                           queue: DispatchQueue = DispatchQueue.main,
                           afunc: @escaping AFunc = { ret, _ in ret(nil) }) -> AFunc {
    return { (ret: @escaping (Any?) -> Void, args: Any?) in
      queue.asyncAfter(
        deadline: DispatchTime.now() + Double(Int64(UInt64(delay * 1000.0) * NSEC_PER_MSEC)) / Double(NSEC_PER_SEC),
        execute: { () -> Void in afunc(ret, args) })
    }
  }
}

public class Future<T> {
  private var set: Bool = false
  private var value: T!
  private var error: Error?
  private var semaphore = DispatchSemaphore(value: 0)
  private var numWaiting = 0
  public func get() throws -> T {
    if !set {
      numWaiting += 1
      semaphore.wait()
    }
    if error != nil {
      throw error!
    }
    return value
  }
  public func set(_ value: T) {
    self.value = value
    set = true
    for _ in 0...numWaiting {
      semaphore.signal()
    }
  }
  public func error(_ value: Error?) {
    self.error = value
    set = true
    for _ in 0...numWaiting {
      semaphore.signal()
    }
  }
}

public class ParserContext {
  private lazy var map_: [String:Any] = [:]
  private var parent_: ParserContext?
  public func get(_ key: String) -> Any? { return map_[key] ?? parent_?.get(key) }
  public func set(_ key: String, _ value: Any) { map_[key] = value }
  public func sub() -> ParserContext {
    let child = ParserContext()
    child.parent_ = self
    return child
  }
}
