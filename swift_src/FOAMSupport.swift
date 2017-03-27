import Foundation

public typealias Listener = (Subscription, [Any?]) -> Void

public protocol Initializable {
  init()
  init(_ args: [String:Any?])
}

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
  var view: FObject.Type? { get }
  var label: String { get }
  var jsonParser: Parser? { get }
  func set(_ obj: FObject, value: Any?)
  func get(_ obj: FObject) -> Any? // TODO rename to f?
  func compareValues(_ v1: Any?, _ v2: Any?) -> Int
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

public class Action: Axiom {
  public var name: String = ""
  public var label: String = ""
  public func call(_ obj: FObject) {
    obj.callAction(key: name)
  }
}

public class Context {
  public static let GLOBAL = Context()
  public func create(type: Any, args: [String:Any?] = [:]) -> Any? {
    var o: Any? = nil
    if let t = type as? Initializable.Type {
      o = t.init(args)
    }
    if var o = o as? ContextAware {
      o.__context__ = self
    }
    return o
  }
  private var slotMap: [String:Slot] = [:]
  public subscript(key: String) -> Any? {
    if let slot = slotMap[key] {
      return slot
    } else if let slot = slotMap[toSlotName(name: key)] {
      return slot.swiftGet()
    }
    return nil
  }
  private func toSlotName(name: String) -> String { return name + "$" }
  public func createSubContext(args: [String:Any?] = [:]) -> Context {
    var slotMap = self.slotMap
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
    return subContext
  }
}

public protocol ClassInfo {
  var id: String { get }
  var parent: ClassInfo { get }
  var ownAxioms: [Axiom] { get }
}

extension ClassInfo {
  var axioms: [Axiom] {
    get {
      var curCls: ClassInfo = self
      var axioms: [Axiom] = []
      while curCls.parent.id != curCls.id {
        axioms += curCls.ownAxioms
        curCls = curCls.parent
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
}

public class ClassInfoImpl: ClassInfo {
  public lazy var id: String = "FObject"
  public lazy var parent: ClassInfo = self
  public lazy var ownAxioms: [Axiom] = []
}

public class Subscription {
  private var detach_: (() -> Void)?
  init(detach: @escaping () ->Void) {
    self.detach_ = detach
  }
  func detach() {
    detach_?()
    detach_ = nil
  }
}

public protocol FObject: class {
  func sub(topics: [String], listener l: @escaping Listener) -> Subscription
  static func classInfo() -> ClassInfo
  func set(key: String, value: Any?)
  func get(key: String) -> Any?
  func getSlot(key: String) -> Slot?
  func hasOwnProperty(_ key: String) -> Bool
  func clearProperty(_ key: String)
  func callAction(key: String)
  func compareTo(_ data: FObject?) -> Int
  init(_ args: [String:Any?])
}

// TODO figure out how to make FObjects implement Comparable.
/*
extension FObject {
  public static func < (lhs: FObject, rhs: FObject) -> Bool { return lhs.compareTo(rhs) < 0 }
  public static func == (lhs: FObject, rhs: FObject) -> Bool { return lhs.compareTo(rhs) == 0 }
  public static func > (lhs: FObject, rhs: FObject) -> Bool { return lhs.compareTo(rhs) > 1 }
}
*/

public class AbstractFObject: NSObject, FObject, Initializable, ContextAware {
  public var __context__: Context = Context.GLOBAL {
    didSet {
      self.__subContext__ = self.__context__.createSubContext(args: self._createExports_())
    }
  }
  lazy private(set) public var __subContext__: Context = {
    return self.__context__.createSubContext(args: self._createExports_())
  }()

  func _createExports_() -> [String:Any?] {
    return [:]
  }

  lazy var listeners: ListenerList = ListenerList()

  private static var classInfo_: ClassInfo! = nil
  public class func classInfo() -> ClassInfo {
    if classInfo_ == nil { classInfo_ = createClassInfo_() }
    return classInfo_
  }

  class func createClassInfo_() -> ClassInfo {
    let classInfo = ClassInfoImpl()
    classInfo.parent = classInfo
    classInfo.id = "FObject"
    return classInfo
  }

  public func set(key: String, value: Any?) {}
  public func get(key: String) -> Any? { return nil }
  public func getSlot(key: String) -> Slot? { return nil }
  public func hasOwnProperty(_ key: String) -> Bool { return false }
  public func clearProperty(_ key: String) {}

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
    if type(of: self).classInfo().id != type(of: data).classInfo().id {
      return type(of: self).classInfo().id > type(of: data).classInfo().id ? 1 : -1
    }
    for props in type(of: data).classInfo().axioms(byType: PropertyInfo.self) {
      let diff = props.compare(self, data)
      if diff != 0 { return diff }
    }
    return 0
  }

  public func callAction(key: String) { }

  public override required init() {}

  public required init(_ args: [String:Any?]) {
    super.init()
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
    detachListeners(listeners: listeners)
  }
}

struct FOAM_utils {
  public static func equals(_ o1: Any?, _ o2: Any?) -> Bool {
    let a = o1 as AnyObject?
    let b = o2 as AnyObject?
    NSLog("%@ == %@", String(describing: a), String(describing: b))
    if a === b { return true }
    if a != nil { return a!.isEqual(b) }
    return false
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
  public static func getInstance(_ c: FObject.Type) -> Parser {
    let info = c.classInfo()
    if let p = parsers[info.id] { return p }
    let parser = buildInstance(info)
    parsers[info.id] = parser
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
