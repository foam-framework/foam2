/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// change package; 
foam.CLASS({
  package: 'com.foam.demos.FOAMBookExample.DAOOperations',
  name: 'Bank',
  properties: [ 'id', 'name' ]
});

foam.CLASS({
  package: 'com.foam.demos.FOAMBookExample.DAOOperations',
  name: 'Customer',
  properties: [ 'id', 'firstName', 'lastName' ]
});

foam.CLASS({
  package: 'com.foam.demos.FOAMBookExample.DAOOperations',
  name: 'Account',
  properties: [ 'id', 'type' ]
});

foam.CLASS({
  package: 'com.foam.demos.FOAMBookExample.DAOOperations',
  name: 'Transaction',
  properties: [
    'id',
    'label',
    'amount',
    { class: 'Date', name: 'date' }
  ]
});

// relate with foreign key relationships
foam.RELATIONSHIP({
  sourceModel: 'com.foam.demos.FOAMBookExample.DAOOperations.Bank',
  forwardName: 'customers', // adds a 'customers' property to Bank
  targetModel: 'com.foam.demos.FOAMBookExample.DAOOperations.Customer',
  inverseName: 'bank' // adds 'bank' property to Customer
});
foam.RELATIONSHIP({
  sourceModel: 'com.foam.demos.FOAMBookExample.DAOOperations.Customer',
  forwardName: 'accounts',
  targetModel: 'com.foam.demos.FOAMBookExample.DAOOperations.Account',
  inverseName: 'owner'
});
foam.RELATIONSHIP({
  sourceModel: 'com.foam.demos.FOAMBookExample.DAOOperations.Account',
  forwardName: 'transactions',
  targetModel: 'com.foam.demos.FOAMBookExample.DAOOperations.Transaction',
  inverseName: 'account'
});

// create the example app with our DAOs exported
foam.CLASS({
  package: 'com.foam.demos.FOAMBookExample.DAOOperations',
  name: 'BankApp',
  requires: [ // using app.Customer.create() gives it our exports
    'com.foam.demos.FOAMBookExample.DAOOperations.Bank',
    'com.foam.demos.FOAMBookExample.DAOOperations.Customer',
    'com.foam.demos.FOAMBookExample.DAOOperations.Account',
    'com.foam.demos.FOAMBookExample.DAOOperations.Transaction',
    'foam.dao.EasyDAO'
  ],
  exports: [ // by default, DAOs are looked up by class name
    'bankDAO',
    'customerDAO',
    'accountDAO',
    'transactionDAO'
  ],
  properties: [
    { name: 'bankDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'banks',
        of: this.Bank, daoType: 'MDAO'
      });
    }},
    { name: 'customerDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'customers',
        seqNo: true,
        of: this.Customer, daoType: 'MDAO'
      });
    }},
    { name: 'accountDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'accounts',
        seqNo: true,
        of: this.Account, daoType: 'MDAO'
      });
    }},
    { name: 'transactionDAO', factory: function() {
      return this.EasyDAO.create({
        name: 'transactions',
        seqNo: true,
        of: this.Transaction, daoType: 'MDAO'
      });
    }}
  ]
});

app = com.foam.demos.FOAMBookExample.DAOOperations.BankApp.create();
// is test/benchmark/index.js on foam1?? else TODO
// test/src/lib/Index.js???

// Load Customers: Sets up Customer DAO with example customers
Promise.all([
  app.customerDAO.put(app.Customer.create({ firstName: 'Sarah', lastName: 'Smith',     bank: 'fn' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'Harry', lastName: 'Sullivan',  bank: 'fn' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'Jamie', lastName: 'MacKenzie', bank: 'fn' })),

  app.customerDAO.put(app.Customer.create({ firstName: 'Herman',  lastName: 'Blackbeard', bank: 'tt' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'Hector',  lastName: 'Barbossa',   bank: 'tt' })),
  app.customerDAO.put(app.Customer.create({ firstName: 'William', lastName: 'Roberts',    bank: 'tt' }))
]);

/* TODO to complete
MySink {
  function put(o, fc) {
    if ( ! mystore.store(o) ) {
      fc && fc.errorEvt("error!"); // updates will cease
    }
  }
}*/

/* TODO to complete
dao.select(foam.dao.QuickSink.create({
  putFn: function(o) {
    console.log("Got an object:", o);
  },
}));*/

// Add 2 items to the DAOs
Promise.all([//return
  app.bankDAO.put(app.Bank.create({ id: 'fn', name: 'First National' })),
  app.bankDAO.put(app.Bank.create({ id: 'tt', name: 'Tortuga Credit Union' }))
]);

app.bankDAO.select().then(function(sink) {
  console.log("Default ArraySink with the entire DAO contents:", sink.a);
});


// mySink = this.ArrayDAO.create(); // DAOs are sinks too!
// dao.where(this.EQ(this.Todo.IS_COMPLETED, false)).select(mySink);

// dao.select(this.COUNT()).then(function(count) {
//   console.log(count.value);
// });

// dao.select().then(function(arraySink) {
// // ArraySinks have a property 'a' with the result array
//   console.log("Length:", arraySink.a.length);
// });

// dao.where(this.EQ(this.Todo.IS_COMPLETED, true)).skip(40).limit(20).select(sink)

/*
dao.where(
  this.AND(
    this.EQ(this.Todo.IS_COMPLETED, true),
    this.CONTAINS_IC(this.Todo.LABEL, "donuts")
  )
)
*/

/*
myDAO.orderBy(this.MyModel.NAME)
myDAO.orderBy(this.DESC(this.MyModel.CREATED_TIME))
myDAO.orderBy(this.DESC(this.MyModel.RANK),
    this.MyModel.LAST_NAME, this.MyModel.FIRST_NAME)
*/

app.bankDAO.where(foam.mlang.predicate.Eq.create({
  arg1: app.Bank.ID, // demos.Person.NAME,
  arg2: 'fn'
}))
.select()
.then(function(a) {
  console.log("The name bank is:");
  a = a.array;
  for ( var i = 0 ; i < a.length ; i++ ) {
    console.log('the bank name for this', a[i].id,'id is', a[i].name);
  }
});


app.bankDAO.on.put.sub(function(s, _, act, obj) {
  console.log("On put", obj.id, obj.name);

  console.log(s);  // Bank DAOs
  console.log(_);  // on
  console.log(act);// put
  console.log(obj);// Bank object
});

app.bankDAO.put(app.Bank.create({ id: 'testBK', name: 'test Bank' }));

app.bankDAO.on.remove.sub(function(s, _, act,obj) {
  console.log("On remove", obj.id, obj.name);
});

app.bankDAO.on.reset.sub(function() {
  console.log("On reset");
});

/*TODO
foam.dao.InternalException // The operation can be retried
foam.dao.ExternalException // The operation will never be able to complete
*/

//TODO
/*
The MDAO class for an ordering, fast lookup, single value,
index multiplexer, or any other MDAO select() assistance class.

The assitance class TreeiNdex implements the
data nodes that hold the indexed items and plan and execute
queries. For any particular operational Index, there may be
many IndexNode instances:

<pre>
1---------> TreeIndex(id)
MDAO: AltIndex 2---------> TreeIndex(propA) ---> TreeIndex(id) -------------> ValueIndex
| 1x AltIndexNode    | 1x TreeIndexNode    | 14x TreeIndexNodes         | (DAO size)x ValueIndexNodes
(2 alt subindexes)     (14 nodes)             (each has 0-5 nodes)
</pre>
The base AltIndex has two complete subindexes (each holds the entire DAO).
The TreeIndex on property A has created one TreeIndexNode, holding one tree of 14 nodes.
Each tree node contains a tail instance of the next level down, thus
the TreeIndex on id has created 14 TreeIndexNodes. Each of those contains some number
of tree nodes, each holding one tail instance of the ValueIndex at the end of the chain.

*/