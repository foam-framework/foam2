
# DAO: Data Access Objects

A DAO, or Data Access Object, is a universal interface to a collection of
objects. The role of a DAO is to operate as an object store, uniquely
identifying objects by their `id`, and allowing queries based on the
object's properties.

To use your class in a DAO, just add an `id` property:

```javascript
foam.CLASS({
  package: 'fun',
  name: 'StoreMe',
  properties: [ 'id' ],
});
```

Your `id` must be unique for separate objects, so either set it carefully or use a
`foam.dao.SequenceNumberDAO` or `foam.dao.EasyDAO` with `seqNo:true` to set
`id` automatically.

## Basic DAO operations

Here are the fundamental functions in the interface, written as though
Javascript functions specified return types:

```javascript
Promise<object> find(id);
Promise<object> put(object);
Promise         remove(object);

Promise<Sink> select(sink);
Promise       removeAll();

//TODO: listen?
void pipe(sink);
```

Most of these operations are asynchronous, indicating completion by resolving
the returned promise. `select` will call `sink.put(object)` on the given sink
for each object, then call `sink.eof()` and resolve the promise.

You can create a sink as an event handler, responding to events as they happen,
or use a sink that accumulates the results and waits until the `select` is
finished. When the promise resolves, your sink will be ready.

## Filtering DAOs

There are four more DAO operations that synchronously return modified DAOs. They
essentially return a window onto part of the data stored in the original DAO.
They can filter, sort, limit results, and skip early results.

```javascript
DAO where(query);
DAO orderBy(sortOrder);
DAO limit(num);
DAO skip(num);
```

Note that each operation returns a DAO, so they can be easily chained:

```javascript
dao.where(this.EQ(this.Todo.IS_COMPLETED, true)).skip(40).limit(20).select(sink)
```

## Querying with mLangs

mLangs are composable objects that allow queries to be expressed without knowing
the underlying target query language. mLangs serialize easily, and can be
compiled into SQL, server-specific query formats, or run directly in Javascript
in the indexed, in-memory `foam.dao.MDAO`.

For example, to pass this filter each object must have an `isCompleted` property
that equals `true`, and a `label` property that contains the string "donuts",
case-insensitive:

```javascript
dao.where(
  this.AND(
    this.EQ(this.Todo.IS_COMPLETED, true),
    this.CONTAINS_IC(this.Todo.LABEL, "donuts")
  )
)
```

The language is extensible, so you can write your own mLangs, or use
`foam.mlang.predicate.Func` to run an inline function on each potential object.
Be aware that custom behavior is harder for DAOs to optimize, so try to
use the standard mLangs.

### Using mLangs

For easy access to the basic mLangs and standard Sinks, either implement
`foam.mlang.Expressions` or create an instance of
`foam.mlang.ExpressionsSingleton`. You'll see this in most of the examples.

```javascript
foam.CLASS({
  name: 'GoingToUseMLangs',
  implements: [ 'foam.mlang.Expressions' ],
  methods: [
    function makeSomeQuery() { return this.EQ(...); }
  ]
});
// or
var m = foam.mlang.ExpressionsSingleton.create();
m.EQ(...)
```

## Sinks

The `Sink` interface is a target for data retrieved from a DAO. Its functions
are called asynchronously by the DAO.

```javascript
void put(obj, [opt_flowControl]);
void remove(obj, [opt_flowControl]);
void eof();
void error(error);
```

See below for the details of when each of these is called. Flow control is
optionally passed in as a way to abort further operations. If the sink has an
unrecoverable error, for instance, calling `errorEvt()` on the flow control
object will hint that the upstream DAO should stop sending `put()`s. If an
internal limit is reached, a call to `stop()` will halt events but not indicate
that an error occurred.

```javascript
MySink {
  function put(o, fc) {
    if ( ! mystore.store(o) ) {
      fc && fc.errorEvt("error!"); // updates will cease
    }
  }
}
```

### Creating a Sink inline

Often you want to perform a query and do something with each object it
produces. You can declare a Sink inline with `foam.dao.QuickSink`:

```javascript
dao.select(foam.dao.QuickSink.create({
  putFn: function(o) {
    console.log("Got an object:", o);
  },
}));
```

## Errors

DAO Operations can throw exceptions that cause their returned Promise to reject.
These errors generally fall into two categories:

```javascript
foam.dao.InternalException // The operation can be retried
foam.dao.ExternalException // The operation will never be able to complete
```

Both carry a `message` property with general information, and more specific
error types will have specific properties detailing the error. For example,
`ObjectNotFoundException.id` notes the ID of the object it couldn't find.

## DAO Operation Methods

In general all DAOs will provide methods to match this behavior. Note that
DAO operations are asynchronous, so if you need to wait for the operation to
complete and read a result, make sure to use the returned Promises.

### find(id)
*`returns Promise<object>`*

Retrieves a single object from the DAO, whose `id` is given.

If the object is found, the promise resolves with the object. If the object is
not found, it rejects with a `foam.dao.ObjectNotFoundException`.

### put(obj)
*`returns Promise<object>`*

Inserts a new object, or updates an existing one. The interface makes no
distinction. Many backends also don't care. DAO implementations for those
backends which do care can perform a `find()` first to check if the object
already exists.

When the object is stored successfully, the promise resolves with the newly added
object. Why return the object? Because the DAO is free to modify the object if
necessary - filling in an autoincremented `id`, or a default value, or otherwise
massaging the data.


### remove(obj)
*`returns Promise`*

Deletes a single object from the DAO.

**NB**: Trying to remove an object which does not exist is **not** an error.
`remove()` only rejects if it fails to communicate with the backend
in some fashion.


### select(sink)
*`returns Promise<sink>`*

The primary way of reading objects from a DAO. `select(sink)` retrieves
a collection of results, sending them to the `sink`. A simple `select(sink)`
returns everything in the DAO.

```javascript
dao.select().then(function(sink) {
  console.log("Default ArraySink with the entire DAO contents:", sink.a);
});
```

Often, `where()`, `orderBy()`, `skip()` and `limit()` will be used first, to
limit the scope of the `select()`.

```javascript
mySink = this.ArrayDAO.create(); // DAOs are sinks too!
dao.where(this.EQ(this.Todo.IS_COMPLETED, false)).select(mySink);
```

The DAOs returned by `where()` and friends are actually small wrappers around
the original DAO that fill in extra, hidden arguments to `select()` and
`removeAll()`.

`select()` calls `sink.put(obj)` repeatedly, once for each object retrieved. It
then calls `sink.eof()` and resolves the returned promise with the same sink
passed in. This allows you to pass in a sink like `ArraySink` or `Count`, and
inspect it after the `select` completes:

```javascript
dao.select(this.COUNT()).then(function(count) {
  console.log(count.value);
});
```

If you don't specify a Sink when calling `select()`, a `foam.dao.ArraySink`
will be created by default and passed to the resolved Promise:

```javascript
dao.select().then(function(arraySink) {
  // ArraySinks have an 'a' property with the result array
  console.log("Length:", arraySink.a.length);
});
```

When calling `select()` or `removeAll()`, the returned Promise will resolve
after all `put` and `remove` operations have been called (if those operations
happen to return Promises, they are ignored).

### removeAll()
*`returns Promise`*

`removeAll()` is very similar to `select()`, with the obvious exception that it
removes all matching entries from the DAO instead of returning them.

Be careful! `myDAO.removeAll()` without any filtering will delete every entry.

## DAO Filtering Methods

These methods return a new DAO that wraps your old one, restricting what you
see when you `select`, and `removeAll`. You can call these methods
multiple times, adding new filters, or call them multiple times on your DAO,
getting different filtered views of the same contents.

**NB:** These filtering methods do not apply to `find`, `remove` or `put`!

### where(predicate)
*`returns DAO`*

`where(predicate)` returns a new DAO that is a filtered window onto the
data in the original.

The `predicate` argument is structured using FOAM's mLang syntax. This is
a structured, injection-safe query language written in Javascript. Just like
SQL, you can compose comparisons like `GT`, `EQ`, `IN`, or `CONTAINS` with
operators like `AND` and `OR`.


### orderBy(order)
*`returns DAO`*

`orderBy(order)` uses a small subset of mLang syntax (see `where()` above) to
specify a sort order.

Some examples:

```javascript
myDAO.orderBy(this.MyModel.NAME)
myDAO.orderBy(this.DESC(this.MyModel.CREATED_TIME))
myDAO.orderBy(this.DESC(this.MyModel.RANK),
    this.MyModel.LAST_NAME, this.MyModel.FIRST_NAME)
```


### limit(num)
*`returns DAO`*

Limits the maximum number of requests returned by the DAO. Mostly useful for
paging results and infinite scrolling.

### skip(num)
*`returns DAO`*

Ignores the first `num` results from the DAO (according to the sort order).
Useful for paging and infinite scrolling.

