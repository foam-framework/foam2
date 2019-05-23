/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Imports and Exports
// Imports Test Class: Imports are pulled from the context when an instance is created
foam.CLASS({
  name: 'ImportsTest',
  imports: [ 'myLogger' ],
  methods: [ function foo() {
    this.myLogger('log foo from ImportTest');
  } ]
});

// Import context values: Classes can import values from the Context so that
// they can be accessed from this
// First try the import with no 'myLogger' in its context
try {
  var o = ImportsTest.create(); // should fail here, on object creation
  // Assertion failed: Missing required import: myLogger in ImportsTest
  console.log('test created');
  o.foo();
} catch (e) {
  console.log('Could not import "myLogger" since nobody provided it.');
}

var lastLogMsg = "";
// Provide a 'myLogger' on a context
var Y = foam.createSubContext({
  myLogger: function(msg) {
    console.log('log:', msg);
    lastLogMsg = msg;
  }
});

Y.myLogger('test');
// Using 'requires' supplies the context automatically, but for this
// example we supply the context explicitly.
var o = ImportsTest.create(null, Y); // create with context Y
o.foo();

// Imports optional: Optional imports, marked with a ?, don't warn if not found
foam.CLASS({
  name: 'OptionalImportsTest',
  imports: [ 'myLogger?' ],
  methods: [ function foo() {
    this.myLogger('log foo from ImportTest');
  } ]
});
try {
  var o = OptionalImportsTest.create();
  console.log('Test created ok');
  console.log('Trying to use missing import...');
  o.foo(); // should fail here, on import use
} catch (e) {
  console.log('As expected, could not import "myLogger" since nobody provided it.');
}

// Export context values: Classes can export values for use by objects they create
var calls = 0;
foam.CLASS({
  name: 'ExportsTest',
  requires: [ 'ImportsTest' ],
  exports: [ 'myLogger' ],
  methods: [
    function init() {
      this.ImportsTest.create().foo();
    },
    function myLogger(msg) {
      // this function is exported, thus available to object we create
      // (like ImportsTest in our init)
      console.log('ExportsTest logger call:', msg);
      calls += 1;
    }
  ]
});
ExportsTest.create();


//Package and imports/exports demo
/*
|----------------------|
|       Account        | 
|----------------------|
| id                   |  
| status               |  
| balance              |  
| setStatus(status)    |  
| deposit(amount)      | 
| withdraw(amount)     |
|----------------------| 
           ^             imports: [ 'reportDeposit' ] 
           |
           |
|----------------------|
|   SavingsAccount     | 
|----------------------|
| withdraw(amount)     |  
|----------------------|  


|------------------------------------|
|            AccountTester           | 
|------------------------------------|
|  reportDeposit (id, amount, bal)   |   
|------------------------------------| 
                                      requires: [
                                        'demo.bank.Account as A',
                                        'demo.bank.SavingsAccount'
                                      ],
                                      imports: [ 'log as l' ],
                                      exports: [
                                        'reportDeposit',
                                        'as Bank' // exports 'this'//TODO this=Bank?
                                      ], 
*/
foam.CLASS({
  package: 'demo.bank',
  name: 'Account',
  imports: [ 'reportDeposit' ],
  properties: [
    {
      name: 'id'
    },
    {
      name: 'status'
    },
    {
      name: 'balance',
      value: 0
    }
  ],
  methods: [
    {
      name: "setStatus",
      code: function(status) {
        this.status = status;
      }
    },
    {
      name: "deposit",
      code: function(amount) {
        this.balance += amount;
        this.reportDeposit(this.id, amount, this.balance);console.log(this, this.__context__); // TODO
                                                                                                // more
                                                                                                // detail
        console.log('Bank: ', this.__context__.Bank);
        return this.balance;
      }
    },
    {
      name: "withdraw",
      code: function(amount) {
        this.balance -= amount;
        return this.balance;
      }
    }
  ]
});
foam.CLASS({
  package: 'demo.bank',
  name: 'SavingsAccount',
  extends: 'demo.bank.Account',
  methods: [
    {
      name: "withdraw",
      code: function(amount) {
        // charge a fee
        this.balance -= 0.05;
        return this.SUPER(amount);
      }
    }
  ]
});
foam.CLASS({
  package: 'demo.bank',
  name: 'AccountTester',
  requires: [
    'demo.bank.Account as A',
    'demo.bank.SavingsAccount'
  ],
  imports: [ 'log as l' ],
  exports: [
    'reportDeposit',
    'as Bank' // exports 'this'
  ],
  methods: [
    function reportDeposit(id, amount, bal) {
      this.l('Deposit: ', id, amount, bal);
    },
    function test() {
      var a = this.A.create({
        id: 42
      });
      a.setStatus(true);
      a.deposit(100);
      a.withdraw(10);
      a.describe();
      var s = this.SavingsAccount.create({
        id: 43
      });
      s.setStatus(true);
      s.deposit(100);
      s.withdraw(10);
      s.describe();
    }
  ]
});
var a = demo.bank.AccountTester.create(null);
a.test();