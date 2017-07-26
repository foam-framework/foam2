# Boxes

The `foam.box.Box` interface is a message-passing interface. Its various
implementations facilitate message passing over various boundaries such as
FOAM contexts, operating system processes, and network layers.

## Boxes and messages

The box interface contains one method:

```
interface Box {
  void send(message);
}
```

The message interface contains a payload and optional routing information:

```
interface Message {
  Object object;     // payload
  Object attributes; // routing information
}
```

## Some patterns over boxes

The Box library contains base classes for several patterns.

### Proxy

A `ProxyBox` is simply any box with a `delegate` of type `Box`. The base
`ProxyBox` simply forwards messages to its `delegate`. Other implementations
typically modify input messages, and then pass the modified message to
their `delegate`.

### Promised

A `PromisedBox` has a `delegate` property that can be set to a
`Promise<Box>`. The `PromisedBox` itself will accept messages immediately and
deliver them when its `delegate` is resolved.

## Boxes as named services

Boxes are typically used to register and expose services that accept
messages. Registering and routing to such services is the role of the
`BoxRegistry` interface:

```
interface BoxRegistry {
  Box  register(opt_name, opt_clientServerService, box);
  void unregister(nameOrBox);
}
```

The `register` method is used to register the input `box` under the name
`opt_name`. If `opt_name` is omitted, the registry selects an available
name. The `opt_clientServerService` parameter is a rarely used mechanism for
decorating `box` and the returned `Box` as follows:

```
boxStoredAsServiceInRegistry = opt_clientServerService.serverBox(box);
boxReturnedByRegisterCall    =
    opt_clientServerService.clientBox(defaultBoxReturnedByRegisterCall);
```

### BoxRegistry as a Box

It is worth mentioning that the most common registry is a
`BoxRegistryBox`. This is a `BoxRegistry` that also implements the `Box`
interface, accepting RPC messages to invoke `register` and `unregister`.

#### Implementation details

The `BoxRegistryBox` maintains a reference to registered boxes (this is
implemented in `BoxRegistry`). When `register` is invoked on the underlying
`BoxRegistry`, the return value is a `SubBox` bound to a particular
`name`. The `SubBox` is a `ProxyBox`, which decorates input messages with its
`name`. The `SubBox` ultimately delegates back to the `BoxRegistryBox` it
came from, which routes sub-box messages to registered services.

### Context: A container for services

The most typical way of deploying boxes in a system is to create a box
`Context` object, which acts as a container for a local `BoxRegistry` and
several services for communicating with other box contexts. Objects created
within a FOAM sub-context of the box context object can access several
entities exported to the box context's FOAM context:

- `registry`: The box context's `BoxRegistry`;

- `messagePortService`: A service for establishing web `MessagePort`
  connections to other box contexts -- e.g., connecting box contexts between a
  main page with a `Worker`, `SharedWorker`, or `ServiceWorker`;

- `socketService`: A service for establishing UNIX socket connections to
  other box contexts;

- `webSocketService`: A service for establishing client/server `WebSocket`
  connections to other box contexts;

- `me`: A box that encapsulates a root service name for this box context.

### Named boxes and name services

TODO(adamvy): Write this section.

## Stubs and skeletons

The `Stub` and `SkeletonBox` constructs elevate box-based message passing to
the level of the interface. `foam.core.StubFactorySingleton` implements:

```
interface StubFactory {
  Class get(Class);
}
```

The `get()` method returns a stub class for the input class. Stub class
instances have a `delegate` property that should be set to a box that accepts
RPC messages over the underlying class's interface.

The dual to a stub class is a `SkeletonBox`. Such a box accepts RPC messages
and replies with RPC return messages when the underlying method has a
well-defined return type. Skeleton boxes have a `delegate` property that
should be set to the implementation of the interface that is to receive RPC
messages (and emit replies).

### Implementation details

There is an unfortunate asymmetry between `foam.core.Stub` (which should not
be confused with a "stub class" mentioned above) and a
`foam.box.SkeletonBox`. One might expect these to be duals of each other, but
they are not. A `Stub` is class of property that augments its containing
class with the interface being stubbed, and expects the property value to be
set to a box (the destination for RPC messages over the stubbed interface).

E.g.,

```js
foam.CLASS({
  name: 'MyInterface',

  methods: [
    function helloWorld() {
      console.log('Hello world!');
      return 'Hello to you, too.';
    }
  ]
});

foam.CLASS({
  name: 'MyInterfaceStub',

  properties: [
    {
      class: 'Stub',
      of: 'MyInterface', // helloWorld() automatically added to MyInterfaceStub.
      name: 'delegate'
    }
  ]
});

var stub = MyInterfaceStub.create(); // Create stub instance.
//
// ... after setting stub.delegate...
//
stub.helloWorld().then(function(resp) {
  console.log('Hello world response:', resp);
  // "Hello world response: Hello to you, too."
})
```

`SkeletonBox` is a wrapper class that has a `delegate` pointing to the
underlying implementation that is used to run RPCs.

E.g.,

```js
// Continued from "Create stub instance." above.
var skeleton = foam.box.SkeletonBox.create({ delegate: MyInterface.create() });
stub.delegate = skeleton;
```

The stub factory interface was created in an attempt to establish better
symmetry:

```js
// With MyInterface above.
var impl = MyInterface.create();
var stub = foam.core.StubFactorySingleton.create().get(MyInterface);
var skeleton = foam.box.SkeletonBox.create({delegate: impl});
stub.delegate = skeleton;
stub.helloWorld();
```

Of course, in a distributed scenario, the flow would look more like:

- Create skeleton of `SomeInterface` on server;
- Register skeleton, yielding a "portable" box that refers to the implementation;
- Send the portable box over some channel (socket, web socket, etc.) to a
  client;
- Client recieves protable box and binds it to the channel from whence it came;
- Client creates a stub of `SomeInterface` and sets its delegate to the
  portable box.

## Box-based DAOs

The box library contains several "client DAO" implementations that are stub
classes over the `foam.dao.DAO` interface with different messaging strateges
(e.g., streaming, polling).
