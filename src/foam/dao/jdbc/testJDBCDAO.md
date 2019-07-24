
To test the JDBCDAO functionality:

1- Add the following declaration to the services.jrl file:
p({"class":"foam.nanos.boot.NSpec", "name":"JDBCConnectionSpec", "lazy":false, "serve":false, "class":"foam.nanos.boot.NSpec", "service":{"class":"foam.dao.jdbc.JDBCConnectionSpec", "databaseServer":"mysql", "hostName":"localhost", "databaseName":"testSQLDAO", "userName":"foam_user", "userPassword":"foam_password"} })

2- Add a declaration to the JDBC connector, for example in gradle:
  compile "mysql:mysql-connector-java:8.0.16"

3- Declare a data model:


foam.CLASS({
  package: 'foam.dao.jdbc',
  name: 'TestDataForJDBC',
  ids: ['id'],
  properties: [
    {
      class: 'Int',
      name: 'id',
      sqlType: 'int'
    },
    {
      class: 'String',
      name: 'name',
      sqlType: 'VARCHAR(40)'
    }
  ]
});

4- Add model declaration to foam's classes.js:

  'foam.dao.jdbc.TestDataForJDBC'
  
5- To verify that the JDBCConnectionSpec service is installed correctly in the context, Recompile and execute the following code:

jdbcSpec = x.get("JDBCConnectionSpec");
print(jdbcSpec);

6- To test the put() method:

jdbcDAO = new foam.dao.jdbc.MySQLJDBCDAO(x, foam.dao.jdbc.TestDataForJDBC.getOwnClassInfo(), "PoolA");
print(jdbcDAO);
testObject = new foam.dao.jdbc.TestDataForJDBC(23,"Sam");
jdbcDAO.put(testObject);

7- To test the sellect() method:

jdbcDAO = new foam.dao.jdbc.JDBCDAO(x, foam.dao.jdbc.TestDataForJDBC.getOwnClassInfo(), "PoolA");
print(jdbcDAO);
foam.dao.Sink sink = jdbcDAO.select();
print(sink);

8- To test find() and remove():

jdbcDAO = new foam.dao.jdbc.MySQLJDBCDAO(x, foam.dao.jdbc.TestDataForJDBC.getOwnClassInfo(), "PoolA");
print(jdbcDAO);

obj = jdbcDAO.find_(x, "34");
print(obj);

jdbcDAO.remove(obj);


Another example using foreign keys:


jdbcSpec = x.get("JDBCConnectionSpec");
print(jdbcSpec);

companyJDBCDAO = new foam.dao.jdbc.MySQLJDBCDAO(x, foam.dao.jdbc.TestCompany.getOwnClassInfo(), "PoolA");
employeeJDBCDAO = new foam.dao.jdbc.MySQLJDBCDAO(x, foam.dao.jdbc.TestEmployee.getOwnClassInfo(), "PoolA");

company1 = new foam.dao.jdbc.TestCompany(3,"KarlToro");
company2 = new foam.dao.jdbc.TestCompany(4,"LocaRola");

companyJDBCDAO.put(company1);
companyJDBCDAO.put(company2);

employee1 = new foam.dao.jdbc.TestEmployee(2,"John", "Smith", 3);
employee2 = new foam.dao.jdbc.TestEmployee(3,"Samuel", "Lee", 4);
employee3 = new foam.dao.jdbc.TestEmployee(6,"Hamlet", "Picard", 3);

employeeJDBCDAO.put(employee1);
employeeJDBCDAO.put(employee2);
employeeJDBCDAO.put(employee3);
