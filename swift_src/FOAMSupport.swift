import Foundation

public typealias Listener = (Subscription, [Any]) -> Void

public protocol Initializable {
  init()
}

protocol ContextAware {
  var __context__: Context { get set }
  var __subContext__: Context { get }
}

public protocol Slot {
  func get() -> Any?
  func set(value: Any?)
  func sub(listener: @escaping Listener) -> Subscription
}

public class PropertySlot: Slot {
  let object: FObject
  let propertyName: String
  init(object: FObject, propertyName: String) {
    self.object = object
    self.propertyName = propertyName
    NSLog("Creating PropertySlot")
  }
  deinit {
    NSLog("Destroying PropertySlot")
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
    NSLog("Creating ConstantSlot")
  }
  deinit {
    NSLog("Destroying ConstantSlot")
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
  init() {
    NSLog("Creating ListenerList")
  }
  deinit {
    NSLog("Destroying ListenerList")
  }
}

public protocol PropertyInfo {
  var classInfo: ClassInfo { get }
  var transient: Bool { get }
  var name: String { get }
}

public extension PropertyInfo {
  public func set(_ obj: FObject, value: Any) {
    obj.set(key: name, value: value)
  }
}

public class EmptyPropertyInfo: PropertyInfo {
  public let classInfo: ClassInfo = EmptyClassInfo()
  public let transient: Bool = false
  public let name: String = ""
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
  public func createSubContext(args: [String:Any] = [:]) -> Context {
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
  var axioms: [FObject] { get }
  func addProperty(_ p: PropertyInfo)
  func axiom(withName name: String) -> FObject?
  func axioms(withClass cls: FObject.Type) -> [FObject]
}

public class EmptyClassInfo: ClassInfo {
  public let id: String = "EmptyClassInfo"
  public var parent: ClassInfo { get { return self } }
  public let axioms: [FObject] = []
  public func addProperty(_ p: PropertyInfo) {}
  public func axiom(withName name: String) -> FObject? { return nil }
  public func axioms(withClass cls: FObject.Type) -> [FObject] { return [] }
}

public class Subscription {
  public let detach: () -> Void
  init(detach: @escaping () ->Void) {
    self.detach = detach
    NSLog("Subscription created")
  }
  deinit {
    NSLog("Subscription destroyed")
  }
}

public protocol FObject {
  func sub(topics: [Any], listener l: @escaping Listener) -> Subscription
  static var classInfo: ClassInfo { get }
  func set(key: String, value: Any?)
  func get(key: String) -> Any?
}

public class AbstractFObject: FObject, Initializable, ContextAware {

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

  public static var classInfo: ClassInfo = {
    return createClassInfo_()
  }()

  class func createClassInfo_() -> ClassInfo { fatalError() }

  public func set(key: String, value: Any?) {}

  public func get(key: String) -> Any? { return nil }

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

  public required init() {
    NSLog("FObject created")
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
    NSLog("FObject destroyed")
  }
}
