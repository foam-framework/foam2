
# Creating a DAO

A DAO, or Data Access Object, is a universal interface to a collection of
objects. The role of a DAO is to operate as an object store, uniquely
identifying objects by their `id`, and allowing queries based on the 
object's properties.

Most custom DAOs can extend `foam.dao.AbstractDAO`. 

To create a DAO, you should be familiar with Javascript Promises. Asynchronous
DAO operations return Promises that resolve when the operation is complete.
Even if your DAO implementation does not have any asynchronous parts, you still
must return a Promise where required.

A basic example of a DAO is `foam.dao.ArrayDAO`, which stores and retrieves 
objects from a plain array. Since its operations are synchronous, it returns a
`Promise.resolved(...)` where promises are required by the DAO interface.

## Basic DAO operations

Here are the fundamental functions in the interface, written as though
Javascript functions specified return types:

    Promise<object> find(id);
    Promise<object> put(object);
    Promise         remove(object);
    
    Promise<Sink> select(sink, skip, limit, order, predicate);
    Promise       removeAll(skip, limit, order, predicate);
    
Most of these operations are asynchronous, indicating completion by resolving
the returned promise. `select` will call `sink.put(object)` events on the given
sink until it is finished, then call `sink.eof()` and resolve the promise.




## Composing other DAOs


