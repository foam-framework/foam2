
# DAO: Data Access Object

A DAO, or Data Access Object, is a universal interface to a collection of
objects. The role of a DAO is to operate as an object store, uniquely
identifying objects by their `id`, and allowing queries based on the 
object's properties.

To use your class in a DAO, just add an `id` property:

    foam.CLASS({
      package: 'fun',
      name: 'StoreMe',
      properties: [ 'id' ],
    });
    
Your `id` must be unique for separate objects, so either set it carefully or use a
`foam.dao.SequenceNumberDAO` or `foam.dao.EasyDAO` with `seqNo:true` to set 
`id` automatically.

## Basic DAO operations

Here are the fundamental functions in the interface, written as though
Javascript functions specified return types:

    Promise<object> find(id);
    Promise<object> put(object);
    Promise         remove(object);
    
    Promise<Sink> select(sink, skip, limit, order, predicate);
    Promise       removeAll(skip, limit, order, predicate);
    
    //TODO: listen?
    void pipe(sink);

Most of these operations are asynchronous, indicating completion by resolving
the returned promise. `select` will call `sink.put(object)` events on the given sink
until it is finished, then call `sink.eof()` and resolve the promise.

You can create a sink as an event handler, responding to events as they happen,
or use a sink that accumulates the results and wait until the `select` is
finished. When the promise resolves, your sink will be ready.

### Filtering DAOs

There are four more DAO operations that synchronously return modified DAOs. They
essentially return a window onto part of the data stored in the original DAO.
They can filter, sort, limit results, and skip early results.

    DAO where(query);
    DAO orderBy(sortOrder);
    DAO limit(num);
    DAO skip(num);

These operations can be easily chained:

    dao.where(this.EQ(this.Todo.IS_COMPLETED, true)).skip(40).limit(20).select(sink)

For easy access to the basic mLangs and Sinks, either implement 
`foam.mlang.Expressions` or create an instance of 
`foam.mlang.ExpressionsSingleton`. You'll see this in most of the examples.

    foam.CLASS({
      name: 'GoingToUseMLangs',
      implements: [ 'foam.mlang.Expressions' ],
      methods: [
        function makeQuery() { return this.EQ; }
      ]
    });
    // or
    var m = foam.mlang.ExpressionsSingleton.create();
    m.EQ(...)

### Sinks

The `Sink` interface is a target for data retrieved from a DAO. Its functions
are called asynchronously by the DAO.

    void put(obj, [opt_flowControl]);
    void remove(obj, [opt_flowControl]);
    void eof();
    void error(error);

When each of these is called is detailed as we summarize the DAO operations
below. Flow control is optionally passed in as a way to stop further operations.
If the sink has an unrecoverable error, for instance, calling `error()`
`stop()` on the flow control object will hint that the upstream DAO should stop.

    MySink {
      function put(o, fc) {
        if ( ! mystore.store(o) ) {
          fc && fc.error(); // updates will cease, if flow control provided
        }
      }
    }


### find(id)

Retrieves a single object from the DAO, whose `id` is given.

If the object is found, the promise resolves with the object. If the object is 
not found, it rejects with an `ObjectNotFoundError`.

### put(obj)

Inserts a new object, or updates an existing one. The interface makes no
distinction. Many backends also don't care, and DAO implementations for those
backends which do care may perform a `find()` first to check if the object
already exists.

When the object is stored successfully, the promise resolves with the newly added
object. Why return
the object? Because the DAO is free to modify the object if necessary - filling
in an autoincremented `id`, or a default value, or otherwise massaging the data.


### remove(obj)

Deletes a single object from the DAO.

**NB**: Trying to remove an object which does not exist is **not** an error.
`remove()` only rejects if it fails to communicate with the backend
in some fashion.


### select(sink, skip, limit, order, predicate)

This is the main event. `select(sink)` retrieves a collection of results from
the DAO. If unfiltered, `select()` returns everything in the DAO.

Often, `where()`, `orderBy()`, `skip()` and `limit()` will be used first, to
limit the scope of the `select()`.

Note that the arguments after `sink` are almost never manipulated directly.
The DAOs returned by
`where()` and friends are actually small wrappers around the original DAO that
populate the filtering arguments on a `select()` or `removeAll()`.

`select()` calls `sink.put(obj)` repeatedly, once for each object retrieved. It
then calls `sink.eof()` and resolves the returned promise with the same sink
passed in. This allows you to pass in a sink like `ArraySink` or `Count`, and 
inspect it after the `select` completes:

    dao.select(this.COUNT()).then(function(count) { console.log(count.value); });

### removeAll(skip, limit, order, predicate)

`removeAll()` is very similar to `select()`, with the obvious exception that it
removes all matching entries from the DAO instead of returning them.

Be careful! `myDAO.removeAll()` without any filtering will delete every entry.


### where(predicate)

`where(predicate)` returns a new DAO that is a filtered window onto the 
data in the original.

The `predicate` argument is structured using FOAM's mLang syntax. This is 
a structured, injection-safe query language written in Javascript. Just like
SQL, you can compose comparisons like GT, EQ, IN, or CONTAINS with operators
like AND and OR.

The language is extensible, so you can write your own mLangs, or use
`foam.mlang.predicate.Func` to run an inline function on each potential object.

### orderBy(order)

`orderBy(order)` uses a small subset of mLang syntax (see `where()` above) to
specify a sort order.

Some examples:

    myDAO.orderBy(this.MyModel.NAME)
    myDAO.orderBy(this.DESC(this.MyModel.CREATED_TIME))
    myDAO.orderBy(this.DESC(this.MyModel.RANK),
        this.MyModel.LAST_NAME, this.MyModel.FIRST_NAME)


### limit(num)

Limits the maximum number of requests returned by the DAO. Mostly useful for
paging results and infinite scrolling.

### skip(num)

Ignores the first `num` results from the DAO (according to the sort order).
Useful for paging and infinite scrolling.

