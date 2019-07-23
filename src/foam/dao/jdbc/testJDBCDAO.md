
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

5- Recompile and execute the following code:

jdbcSpec = x.get("JDBCConnectionSpec");
print(jdbcSpec);

jdbcDAO = new foam.dao.jdbc.JDBCDAO(x, foam.dao.jdbc.TestDataForJDBC.getOwnClassInfo(), "PoolA");
print(jdbcDAO);

testObject = new foam.dao.jdbc.TestDataForJDBC(23,"Sam");

jdbcDAO.put(testObject);



