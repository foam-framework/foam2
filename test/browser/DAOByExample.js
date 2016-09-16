var reg = test.helpers.ExemplarRegistry.create();
var ex;
var examples = [
  {
    name: 'Load MLangs',
    description: "Loads the mlang query langauage",
    code: function() {
      global.M = foam.mlang.ExpressionsSingleton.create();
    }
  },
  {
    name: 'Bank Classes',
    description: 'Example data models for bank accounts',
    code: function() {
      foam.CLASS({
        package: 'example',
        name: 'Bank',
        properties: [ 'id', 'name' ]
      });
      foam.CLASS({
        package: 'example',
        name: 'Customer',
        properties: [ 'id', 'firstName', 'lastName' ]
      });      
      foam.CLASS({
        package: 'example',
        name: 'Account',
        properties: [ 'id', 'type' ]
      });
      foam.CLASS({
        package: 'example',
        name: 'Transaction',
        properties: [
          'id',
          'label',
          'amount',
          { class: 'Date', name: 'date' }, 
        ]
      });
      
      // relate with foreign key relationships
      foam.RELATIONSHIP({
        sourceModel: 'example.Bank',
        name: 'customers', // adds a 'customers' property to Bank
        targetModel: 'example.Customer',
        inverseName: 'bank' // adds 'bank' property to Customer
      });
      foam.RELATIONSHIP({
        sourceModel: 'example.Customer',
        name: 'accounts',
        targetModel: 'example.Account',
        inverseName: 'owner'
      });
      foam.RELATIONSHIP({
        sourceModel: 'example.Account',
        name: 'transactions',
        targetModel: 'example.Transaction',
        inverseName: 'account'
      });
      
      // create the example app with our DAOs exported
      foam.CLASS({
        package: 'example',
        name: 'BankApp',
        requires: [ // using app.Customer.create() gives it our exports
          'example.Bank',
          'example.Customer',
          'example.Account',
          'example.Transaction',
          'foam.dao.EasyDAO'
        ],
        exports: [ // by default, DAOs are looked up by class name
          'bankDAO as example.BankDAO',
          'customerDAO as example.CustomerDAO',
          'accountDAO as example.AccountDAO',
          'transactionDAO as example.TransactionDAO',
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
          }},
        ]
      });
      global.app = example.BankApp.create();
    }
  },
  {
    name: 'Load Banks',
    description: "Sets up Bank DAO with example banks",
    dependencies: [ 'Bank Classes' ],
    code: function async() {
      return Promise.all([
        app.bankDAO.put(app.Bank.create({ id: 'fn', name: 'First National' })),
        app.bankDAO.put(app.Bank.create({ id: 'tt', name: 'Tortuga Credit Union' }))
      ]);
    }
  },
  {
    name: 'Load Customers',
    description: "Sets up Customer DAO with example customers",
    dependencies: [ 'Bank Classes', 'Load Banks' ],
    code: function async() {

      return Promise.all([
        app.customerDAO.put(app.Customer.create({ firstName: 'Sarah',  lastName: 'Smith',    bank: 'fn' })),
        app.customerDAO.put(app.Customer.create({ firstName: 'Harry',  lastName: 'Sullivan', bank: 'fn' })),
        app.customerDAO.put(app.Customer.create({ firstName: 'Albert', lastName: 'Bronson',  bank: 'fn' })),

        app.customerDAO.put(app.Customer.create({ firstName: 'Herman',  lastName: 'Blackbeard', bank: 'tt' })),
        app.customerDAO.put(app.Customer.create({ firstName: 'Hector',  lastName: 'Barbossa',   bank: 'tt' })),
        app.customerDAO.put(app.Customer.create({ firstName: 'William', lastName: 'Roberts',    bank: 'tt' })),
      ]);
    }
  },
  {
    name: 'Create Accounts',
    description: "Sets up Accounts DAO with example account, by select()ing into a sink",
    dependencies: [ 'Load Customers' ],
    code: function async() {
      // we want to wait for the puts to complete, so save the promises
      accountPuts = [];
      // Generate accounts for each customer. Select into an in-line 
      // sink to process results as they come in.
      return app.customerDAO.select(foam.dao.QuickSink.create({
        putFn: function(customer) {
          // create accounts, add to accountDAO, save the promises for later
          // so we know all the puts have completed.
          accountPuts.push(customer.accounts.put(app.Account.create({ type: 'chq' })));
          accountPuts.push(customer.accounts.put(app.Account.create({ type: 'sav' })));
        } 
      })).then(function() {
        return Promise.all(accountPuts);
      });
    }
  },
  {
    name: 'Create Transactions',
    description: "Sets up Transactions DAO with example transactions",
    dependencies: [ 'Load MLangs', 'Create Accounts' ],
    code: function async() {
      // we want to wait for the puts to complete, so save the promises
      transactionPuts = [];
      
      // Generate transactions for each account. 
      var amount = 0;
      var date = new Date(0);
      
      // functions to generate some data
      function generateAccountChq(account) {
        for ( var j = 0; j < 10; j++ ) {
          date.setDate(date.getDate() + 1);
          transactionPuts.push(account.transactions.put(app.Transaction.create({
            date: new Date(date),
            label: 'x'+amount+'x',
            amount: ((amount += 0.25) % 20) - 5
          })));
        }
      }
      function generateAccountSav(account) {
        for ( var j = 0; j < 5; j++ ) {
          date.setDate(date.getDate() + 2.5);
          transactionPuts.push(account.transactions.put(app.Transaction.create({
            date: new Date(date),
            label: 's'+amount+'s',
            amount: ((amount += 1.5) % 50)
          })));        
        }
      }
      
      // Select into an ArraySink, which dumps the results of the query to a 
      // plain array, and run data generating functions for each one.
      // Calling select() with no arguments resolves with an ArraySink.
      // If you pass a sink to .select(mySink), your sink is resolved.
      
      // Select 'chq' accounts first
      return app.accountDAO.where(M.EQ(app.Account.TYPE, 'chq'))
        .select().then(function(defaultArraySink) {
          var accounts = defaultArraySink.a;
          for ( var i = 0; i < accounts.length; i++ ) {
            generateAccountChq(accounts[i]);
          }
      }).then(function() {
        // Then select 'sav' accounts
        amount = 0;
        date = new Date(0);
        app.accountDAO.where(M.EQ(app.Account.TYPE, 'sav'))
          .select().then(function(defaultArraySink) {
            var accounts = defaultArraySink.a;
            for ( var i = 0; i < accounts.length; i++ ) {
              generateAccountSav(accounts[i]);
            }
          });
      }).then(function() {
        // build transactionPuts first, when selects are done the list is ready
        return Promise.all(transactionPuts);
      });
    }
  },
  
  {
    name: 'Join',
    description: "Finds all transactions for a given customer",
    dependencies: [ 'Load MLangs', 'Create Transactions' ],
    code: function async() {
      var tsink = foam.dao.ArrayDAO.create();
      var nullSink = foam.dao.QuickSink.create();
      
      
      // Start querying at the top, and produce a larger set of results 
      //   to sub-query at each step
      return app.customerDAO.find(2)
        .then(function(customer) {
          var transactionSelectPromises = [];
          return customer.accounts.select(foam.dao.QuickSink.create({
            putFn: function(account) {
              // no route to return promise here, since Sink.put doesn't return a promise...
              transactionSelectPromises.push(account.transactions.select(tsink));
            }
          })).then(function() {
            return Promise.all(transactionSelectPromises);
          })
        }).then(function() {
          foam.u2.TableView.create({ of: app.Transaction, data: tsink }).write();
        });
    }
  },
  
  // {
  //   name: 'Manual Join',
  //   description: "Without using Relationships, finds all transactions for a given customer",
  //   dependencies: [ 'Load MLangs', 'Create Transactions' ],
  //   code: function async() {
  //     var tsink = foam.dao.ArrayDAO.create();
  //     var nullSink = foam.dao.QuickSink.create();
  //
  //     var promises = [];
  //     // to store intermediate reuslts for matching customer IDs
  //     var customerIds = foam.dao.ArraySink.create();
  //     // to store intermediate results for matching account IDs
  //     var accountIds = foam.dao.ArraySink.create();
  //     // Start querying at the top, and produce a larger set of results
  //     //   to sub-query at each step
  //     return app.customerDAO
  //       .where(M.EQ(app.Customer.ID, 2)) // a fixed customer ID, in this case
  //       .select(M.MAP(app.Customer.ID, customerIds)) // extract ID from results
  //       .then(function() {
  //         return app.accountDAO // query matches for the array of customer IDs
  //           .where(M.IN(app.Account.OWNER, customerIds.a))
  //           .select(M.MAP(app.Account.ID, accountIds)) // extract account ID
  //           .then(function() {
  //               return app.transactionDAO // query matches for list of accounts
  //                 .where(M.IN(app.Transaction.ACCOUNT, accountIds.a))
  //                 .select(tsink) // could dedup, but no duplicates in this case
  //           });
  //       }).then(function(results) {
  //         foam.u2.TableView.create({ of: app.Transaction, data: results }).write();
  //       });
  //   }
  // },
  
].forEach(function(def) {
  ex = test.helpers.Exemplar.create(def, reg);
  // Note: eval() for each exemplar may be async, so don't
  // nuke the context without waiting for the promise to resolve
  
  //foam.__context__ = oldContext;
  //varoldContext = foam.__context__;
  //foam.__context__ = foam.createSubContext({});


});
document.write("<hr><pre>"+
ex.generateExample()+
eval(ex.generateExample())+
"</pre>");
// foam.u2.TableView.create({ of: app.Bank, data: app.bankDAO }).write();
// foam.u2.TableView.create({ of: app.Customer, data: app.customerDAO }).write();
// foam.u2.TableView.create({ of: app.Account, data: app.accountDAO }).write();
// foam.u2.TableView.create({ of: app.Transaction, data: app.transactionDAO }).write();