/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'fun',
  name: 'StoreMe',
  properties: [ 'id' ],
});

// app.Customer.create({ firstName: 'Sarah', lastName: 'Smith', bank: 'fn' })

var a = foam.dao.LocalStorageDAO.create({ of: fun.StoreMe });
a.put(fun.StoreMe.create({id:1}));

// in java
/*return new foam.dao.PMDAO(x, new foam.dao.java.JDAO(x, net.nanopay.integration.APIStatus.getOwnClassInfo(), "apiStatusDAO")).build();

//TODO in JS...

// in java
return new foam.dao.EasyDAO.Builder(x).
  setPm(true).
  setAuthenticate(false).
  setJournalType(foam.dao.JournalType.SINGLE_JOURNAL).
  setJournalName("branches").
  setSeqNo(true).
  setOf(net.nanopay.model.Branch.getOwnClassInfo()).
build();*/

/*TODO Database specification
foam.dao.EasyDAO.create({ daoType: 'IDB' });
foam.dao.EasyDAO.create({ daoType: 'LOCAL' });
foam.dao.EasyDAO.create({ daoType: 'MDAO' });
foam.dao.EasyDAO.create({ daoType: foam.dao.NullDAO });
//TODO to complete
*/

/*TODO Decorator specification
foam.dao.EasyDAO.create({ cache: true });
//TODO to complete
*/

/*
foam.dao.EasyDAO.create({ seqNo: true, seqProperty: 'id' });
//or
foam.dao.EasyDAO.create({ guid: true, seqProperty: 'id' });
*/


//TODO the complete list
// If your object has a lot of String properties, enable `dedup` to ensure that duplicate string values don't consume a lot of memory.
//foam.dao.EasyDAO.create({ dedup: true });

// To record a complete journal of all writes to your EasyDAO, you can enable `journal` to keep a history.
//foam.dao.EasyDAO.create({ journal: true });

// If your data model has `imports`, it will need a parent context from which to
// find those import values. This can be provided by enabling `contextualize` on
// your EasyDAO, and making sure the EasyDAO itself, or one of its ancestors in
// the creation chain, exports those values.
//foam.dao.EasyDAO.create({ contextualize: true });

// You can enabled console logging of DAO operations by enabling `logging`.
//foam.dao.EasyDAO.create({ logging: true });

// And for benchmarking, timing of DAO operations is enabled with `timing`.
//foam.dao.EasyDAO.create({ timing: true });


//TODO to complete
// Synchronization between multiple Clients and Server
/*
For this purpose, you need to specify:
  `syncProperty` indicates the property to synchronize on. This is typically an 
    integer property indicating the version last seen on the remote server. Use
    an actual property reference (such as `example.MyClass.MY_PROPERTY`) not the
    string name of the property.
  `serverUri` specifies the URI of the server to use. If sockets is true, this 
    will use a web socket, otherwise HTTP to contact the server-side DAO. 
On your server, 
  use an EasyDAO with `isServer: true` to provide the other end of the connection.
  Setting `syncPolling` to true activates polling, periodically checking in with the server. 
    If sockets are used, polling is optional as the server can push changes to this client.
*/
/*TODO to complete
foam.dao.EasyDAO.create({
  //...
  syncWithServer: true,
  syncProperty: 'foo.myModel.VERSION',
  serverUri: 'localhost:7000',
  syncPolling: true,
  sockets: false
});*/


/*
Index: Alt[ID, TreeA, TreeB]
IndexNodes: [id, a,b], [id, a], [id, b], [id, a], [id]
*/