var reg = test.helpers.ExemplarRegistry.create();

var examples = [
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
        properties: [ 'id', 'date', 'label', 'amount' ]
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
    }
  },
  {
    name: 'Load Banks',
    description: "Sets up Bank DAO with example banks",
    dependencies: [ 'Bank Classes' ],
    code: function async() {

      var bankDAO = foam.dao.EasyDAO.create({
        name: 'banks',
        of: example.Bank,
        type: 'MDAO'
      });

      return Promise.all([
        bankDAO.put(example.Bank.create({ id: 'fn', name: 'First National' })),
        bankDAO.put(example.Bank.create({ id: 'tt', name: 'Tortuga Credit Union' }))
      ]).then(function() { return bankDAO; });
    }
  },
  {
    name: 'Load Customers',
    description: "Sets up Customer DAO with example customers",
    code: function async() {

      var customerDAO = foam.dao.EasyDAO.create({
        name: 'customers',
        of: example.Customer,
        seqNo: true,
        type: 'MDAO'
      });

      return Promise.all([
        customerDAO.put(example.Customer.create({ firstName: 'Sarah', lastName: 'Smith' })),
        customerDAO.put(example.Customer.create({ firstName: 'Harry', lastName: 'Sullivan' })),
        customerDAO.put(example.Customer.create({ firstName: 'Albert', lastName: 'Bronson' })),
      ]).then(function() { return customerDAO; });
    }
  },
  
].forEach(function(def) {
  var ex = test.helpers.Exemplar.create(def, reg);
  var oldContext = foam.__context__;
  foam.__context__ = foam.createSubContext({});

  document.write("<hr><pre>"+
  ex.generateExample()+
  eval(ex.generateExample())+
  "</pre>");

  foam.__context__ = oldContext;
});
