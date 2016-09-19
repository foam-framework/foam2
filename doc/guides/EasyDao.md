
# EasyDAO: One-stop shop for data source configuration

A DAO, or Data Access Object, is a universal interface to a collection of
objects. `foam.dao.EasyDAO` configures itself automatically, based on the
configuration flags you specify when creating an EasyDAO.

To store your class in an EasyDAO, just add an `id` property:

    foam.CLASS({
      package: 'fun',
      name: 'StoreMe',
      properties: [ 'id' ],
    });

Your `id` must be unique for separate objects, so either set it carefully or
set `EasyDAO.seqNo` to `true` to assign `id` automatically.

## Storage Type

The basic storage mechanism your EasyDAO will provide is configured by setting
`daoType`:

Choose a default for IndexedDB, browser local storage, or in-memory MDAO:

    foam.dao.EasyDAO.create({ daoType: 'IDB' });
    foam.dao.EasyDAO.create({ daoType: 'LOCAL' });
    foam.dao.EasyDAO.create({ daoType: 'MDAO' });

or specify the actual DAO class to use:

    foam.dao.EasyDAO.create({ daoType: foam.dao.NullDAO });

Note that if you enable server-synchronization or journalling, the extra
DAOs created to support those features will be of the same type.

## Caching

For IndexedDB, disk or network-based DAO types, in-memory caching significantly
speeds up data access and querying. Add `cache: true` to automatically
set up an MDAO as an indexed, in-memory cache.

    foam.dao.EasyDAO.create({ cache: true });

Note that if caching is enabled, `autoIndex` can be enabled to automatically
generate indexes as queries are made. The `addIndex()` method can be
used to manually add indexes.

## ID Assignment

To ensure your objects have unique IDs, you can use sequence numbers or guids
to auto-assign unique `id`s to the objects `put()` into the EasyDAO. Specify
the property name in `seqProperty` if you are not using the default of `id` as
your primary key.

    foam.dao.EasyDAO.create({ seqNo: true, seqProperty: 'id' });

or

    foam.dao.EasyDAO.create({ guid: true, seqProperty: 'id' });

You can't use both at once, and they are optional if your objects already
have unique identifiers.

## Special Features

### String Deduplication

If your object has a lot of String properties, enable `dedup` to ensure
that duplicate string values don't eat up a lot of memory.

    foam.dao.EasyDAO.create({ dedup: true });

### Journalling

To record a complete journal of all writes to your EasyDAO, you can
enable `journal` to keep a history.

    foam.dao.EasyDAO.create({ journal: true });

Note that this history is stored in the same type of DAO as your
EasyDAO (IndexedDB, MDAO, etc.) and will be **very large** if your DAO
has a lot of activity. The **complete state** of each object may be stored on
each `put()` or `remove()` operation.

### Contextutalizing

If your data model has `imports`, it will need a parent context from which to
find those import values. This can be provided by enabling `contextualize`
on your EasyDAO, and making sure the EasyDAO itself, or one of its
ancestors in the creation chain, exports those values.

    foam.dao.EasyDAO.create({ contextualize: true });

## Debug features

You can enabled console logging of DAO operations by enabling `logging`:

    foam.dao.EasyDAO.create({ logging: true });

And for benchmarking, timing of DAO operations is enabled with `timing`

    foam.dao.EasyDAO.create({ timing: true });


## Synchronization between multiple Clients and Server

Turn on `syncWithServer` to activate synchronization with a server.
Specify `serverUri` and `syncProperty` as well.

`syncProperty` indicates the property to synchronize on. This is typically
an integer property indicating the version last seen on the remote server.
Use an actual property reference (such as `example.MyClass.MY_PROPERTY`)
not the string name of the property.

`serverUri` specifies the URI of the server to use. If sockets is true, this
will use a web socket, otherwise HTTP to contact the server-side DAO. On your
server, use an EasyDAO with `isServer: true` to provide the other end
of the connection.

Setting `syncPolling` to true activates polling, periodically checking in with
the server. If sockets are used, polling is optional as the server
can push changes to this client.

    foam.dao.EasyDAO.create({
      ...
      syncWithServer: true,
      syncProperty: foo.myModel.VERSION,
      serverUri: 'localhost:7000',
      syncPolling: true,
      sockets: false
    });



