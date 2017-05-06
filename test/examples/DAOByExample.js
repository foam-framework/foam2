/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var examples = [
  {
    name: 'Load MLangs',
    description: "Loads the mlang query langauage",
    code: function() {
      var M = foam.mlang.ExpressionsSingleton.create();
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
        forwardName: 'customers', // adds a 'customers' property to Bank
        targetModel: 'example.Customer',
        inverseName: 'bank' // adds 'bank' property to Customer
      });
      foam.RELATIONSHIP({
        sourceModel: 'example.Customer',
        forwardName: 'accounts',
        targetModel: 'example.Account',
        inverseName: 'owner'
      });
      foam.RELATIONSHIP({
        sourceModel: 'example.Account',
        forwardName: 'transactions',
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
          'bankDAO',
          'customerDAO',
          'accountDAO',
          'transactionDAO',
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
      var app = example.BankApp.create();
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
        app.customerDAO.put(app.Customer.create({ firstName: 'Jamie', lastName: 'MacKenzie',  bank: 'fn' })),

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
          accountPuts.push(customer.accounts.dao.put(app.Account.create({ type: 'chq' })));
          accountPuts.push(customer.accounts.dao.put(app.Account.create({ type: 'sav' })));
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
          transactionPuts.push(account.transactions.dao.put(app.Transaction.create({
            date: new Date(date),
            label: 'x'+amount+'x',
            amount: ((amount += 0.25) % 20) - 5 + (amount % 2) * 5
          })));
        }
      }
      function generateAccountSav(account) {
        for ( var j = 0; j < 5; j++ ) {
          date.setDate(date.getDate() + 2.5);
          transactionPuts.push(account.transactions.dao.put(app.Transaction.create({
            date: new Date(date),
            label: 's'+amount+'s',
            amount: ((amount += 1.5) % 50) + (amount % 4) * 5
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
    platforms: { web: true },
    code: function async() {
      var tsink = foam.dao.ArrayDAO.create();
      foam.u2.TableView.create({ of: app.Transaction, data: tsink }).write();

      // Start querying at the top, and produce a larger set of results
      //   to sub-query at each step
      return app.customerDAO.find(2)
        .then(function(customer) {
          var transactionSelectPromises = [];
          return customer.accounts.dao.select(foam.dao.QuickSink.create({
            putFn: function(account) {
              // no route to return promise here, since Sink.put doesn't return a promise...
              transactionSelectPromises.push(account.transactions.select(tsink));
            }
          })).then(function() {
            return Promise.all(transactionSelectPromises);
          })
        });
    }
  },

  {
    name: 'Manual Join',
    description: "Without using Relationships, finds all transactions for a given customer",
    dependencies: [ 'Load MLangs', 'Create Transactions' ],
    platforms: { web: true },
    code: function async() {
      var tsink = foam.dao.ArrayDAO.create();
      foam.u2.TableView.create({ of: app.Transaction, data: tsink }).write();

      // to store intermediate reuslts for matching customer IDs
      var customerIds = foam.dao.ArraySink.create();

      // to store intermediate results for matching account IDs
      var accountIds = foam.dao.ArraySink.create();

      // Start querying at the top, and produce a larger set of results
      //   to sub-query at each step
      return app.customerDAO
        .where(M.EQ(app.Customer.ID, 2)) // a fixed customer ID, in this case
        .select(M.MAP(app.Customer.ID, customerIds)) // extract ID from results
        .then(function() {
          return app.accountDAO // query matches for the array of customer IDs
            .where(M.IN(app.Account.OWNER, customerIds.a))
            .select(M.MAP(app.Account.ID, accountIds)) // extract account ID
            .then(function() {
                return app.transactionDAO // query matches for list of accounts
                  .where(M.IN(app.Transaction.ACCOUNT, accountIds.a))
                  .select(tsink) // could dedup, but no duplicates in this case
            });
        });
    }
  },

  // {
  //   name: 'Table Output',
  //   description: "Outputs Banking DAOs into simple tables",
  //   dependencies: [ 'Create Transactions' ],
  //   code: function() {
  //     foam.__context__.document.write("Banks");
  //     foam.u2.TableView.create({ of: app.Bank, data: app.bankDAO }).write();
  //
  //     foam.__context__.document.write("Customers");
  //     foam.u2.TableView.create({ of: app.Customer, data: app.customerDAO }).write();
  //
  //     foam.__context__.document.write("Accounts");
  //     foam.u2.TableView.create({ of: app.Account, data: app.accountDAO }).write();
  //
  //     foam.__context__.document.write("Transactions");
  //     foam.u2.TableView.create({ of: app.Transaction, data: app.transactionDAO }).write();
  //   }
  // },

  {
    name: 'Selecting with skip and limit',
    description: "A pseudo scroll effect with skip and limit",
    dependencies: [ 'Load Customers', 'Create Accounts' ],
    platforms: { web: true },
    code: function() {
      var proxyDAO = foam.dao.ProxyDAO.create({ delegate: app.customerDAO });
      var skip = 0;
      var limit = 3;

      // Change skip value, reassign the proxy's source.
      // The table will update automatically.
      setInterval(function() {
        skip = (skip + 1) % 4;
        proxyDAO.delegate = app.customerDAO.skip(skip).limit(limit);
      }, 500);

      foam.__context__.document.write("Customers with Skip and Limit");
      foam.u2.TableView.create({ of: app.Customer, data: proxyDAO }).write();
    }
  },

  {
    name: 'Ordering',
    description: "Sorting results",
    dependencies: [ 'Create Transactions' ],
    platforms: { web: true },
    code: function async() {
      return app.accountDAO.find(3).then(function(account) {
        var transactionsDAO = account.transactions;

        foam.__context__.document.write("Sort by amount, descending");
        foam.u2.TableView.create({
          of: app.Transaction,
          data: transactionsDAO.orderBy(M.DESC(app.Transaction.AMOUNT))
        }).write();

        foam.__context__.document.write("Sort by date");
        foam.u2.TableView.create({
          of: app.Transaction,
          data: transactionsDAO.orderBy(app.Transaction.DATE)
        }).write();
      })
    }
  },
];

global.FBEreg = global.FBEreg || test.helpers.ExemplarRegistry.create();
global.FBE = global.FBE || [];
examples.forEach(function(def) {
  FBE.push(test.helpers.Exemplar.create(def, FBEreg));
});


// var oldContext;
// foam.async.repeat(exemplars.length, function runExemplar(index) {
//   var ex = exemplars[index];
//   // Note: eval() for each exemplar may be async, so don't
//   // nuke the context without waiting for the promise to resolve
//   if ( oldContext) foam.__context__ = oldContext;

//   oldContext = foam.__context__;
//   foam.__context__ = foam.createSubContext({});

//   var code = ex.generateExample();
//   foam.__context__.document.write("<hr><pre>"+code+"</pre>");
//   var result = eval("(function runExemplar___() { " + code + " })();");
//   return result;
// })();
