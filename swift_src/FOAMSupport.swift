import Foundation

public typealias Listener = (Subscription, [Any]) -> Void

public protocol Initializable {
  init()
}

public protocol ContextAware {
  var __context__: Context { get set }
  var __subContext__: Context { get }
}

public protocol Axiom {
  var name: String { get }
}

public protocol Slot {
  func get() -> Any?
  func set(value: Any?)
  func sub(listener: @escaping Listener) -> Subscription
}

extension Slot {
  public func linkFrom(_ s2: Slot) -> Subscription {

    let s1 = self
    var feedback1 = false
    var feedback2 = false

    let l1 = { () -> Void in
      if feedback1 { return }

      if !FOAM_utils.equals(s1.get(), s2.get()) {
        feedback1 = true
        s2.set(value: s1.get())
        if !FOAM_utils.equals(s1.get(), s2.get()) { s1.set(value: s2.get()) }
        feedback1 = false
      }
    }

    let l2 = { () -> Void in
      if feedback2 { return }

      if !FOAM_utils.equals(s1.get(), s2.get()) {
        feedback2 = true
        s1.set(value: s2.get())
        if !FOAM_utils.equals(s1.get(), s2.get()) { s2.set(value: s1.get()) }
        feedback2 = false
      }
    }

    var sub1: Subscription? = s1.sub { (_, _) in l1() }
    var sub2: Subscription? = s2.sub { (_, _) in l2() }

    l2()

    return Subscription {
      sub1?.detach()
      sub2?.detach()
      sub1 = nil
      sub2 = nil
    }
  }

  public func linkTo(_ other: Slot) -> Subscription {
    return other.linkFrom(self)
  }

  public func follow(_ other: Slot) -> Subscription {
    let l = { () -> Void in
      if !FOAM_utils.equals(self.get(), other.get()) {
        self.set(value: other.get())
      }
    }
    l()
    return other.sub { (_, _) in l() }
  }

  public func mapFrom(_ other: Slot, _ f: @escaping (Any?) -> Any?) -> Subscription {
    let l = { () -> Void in
      self.set(value: f(other.get()))
    }
    l()
    return other.sub { (_, _) in l() }
  }

  public func mapTo(_ other: Slot, _ f: @escaping (Any?) -> Any?) -> Subscription {
    return other.mapFrom(self, f)
  }
}

public class PropertySlot: Slot {
  weak var object: FObject!
  let propertyName: String
  init(object: FObject, propertyName: String) {
    self.object = object
    self.propertyName = propertyName
  }
  public func get() -> Any? {
    return object.get(key: propertyName)
  }
  public func set(value: Any?) {
    object.set(key: propertyName, value: value)
  }
  public func sub(listener: @escaping Listener) -> Subscription {
    return object.sub(topics: ["propertyChange", propertyName], listener: listener)
  }
}

public class ConstantSlot: Slot {
  let value: Any?
  init(value: Any?) {
    self.value = value
  }
  public func get() -> Any? { return value }
  public func set(value: Any?) { fatalError("Cannot mutate constant slot") }
  public func sub(listener: @escaping Listener) -> Subscription {
    fatalError("Cannot subscribe to constant slot")
  }
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
}

public extension PropertyInfo {
  public func set(_ obj: FObject, value: Any) {
    obj.set(key: name, value: value)
  }
}

public class PropertyInfoImpl: PropertyInfo {
  public lazy var classInfo: ClassInfo = ClassInfoImpl()
  public lazy var transient: Bool = false
  public lazy var name: String = ""
  public var view: FObject.Type? = nil
  public var label: String = ""
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
  public func create(type: Any) -> Any? {
    var o: Any? = nil
    if let t = type as? Initializable.Type {
      o = t.init()
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
      return slot.get()
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
        slotMap[slotName] = ConstantSlot(value: value)
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
  func sub(topics: [Any], listener l: @escaping Listener) -> Subscription
  static func classInfo() -> ClassInfo
  func set(key: String, value: Any?)
  func get(key: String) -> Any?
  func getSlot(key: String) -> Slot?
  func callAction(key: String)
}

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

  public func sub(
    topics: [Any] = [],
    listener l: @escaping Listener) -> Subscription {

    var listeners = self.listeners
    for i in 0..<topics.count {
      guard let topic = topics[i] as? String else {
        fatalError("sub args must be strings except for last arg.")
      }
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

  public func callAction(key: String) { }

  public required override init() {
  }

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
    if a === b { return true }
    if a != nil { return a!.isEqual(b) }
    return false
  }
}
