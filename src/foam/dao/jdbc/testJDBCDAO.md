
To test the JDBCDAO functionality:

1- Add the following declaration to the services.jrl file:

p({"class":"foam.nanos.boot.NSpec", "name":"JDBCConnectionSpec", "lazy":false, "serve":false, "class":"foam.nanos.boot.NSpec", "service":{"class":"foam.dao.jdbc.JDBCConnectionSpec", "databaseServer":"mysql", "hostName":"localhost", "databaseName":"testSQLDAO", "userName":"foam_user", "userPassword":"foam_password"} })


2- Add a declaration to the JDBC connector, for example in gradle:

  compile "mysql:mysql-connector-java:8.0.16"


3- Declare a data model:

foam.CLASS({
  package: 'foam.dao.jdbc',
  name: 'TestEmployee',
  ids: ['id'],
  properties: [
    {
      name: 'id',
      class: 'Int',
      sqlType: 'int'
    },
    {
      name: 'firstName',
      class: 'String',
      sqlType: 'VARCHAR(40)'
    },
    {
      name: 'lastName',
      class: 'String',
      sqlType: 'VARCHAR(40)'
    }
  ]
});


4- Add model declaration to foam's classes.js:

  'foam.dao.jdbc.TestEmployee'
  
  
5- To verify that the JDBCConnectionSpec service is installed correctly in the context, Recompile and execute the following code:

 jdbcSpec = x.get("JDBCConnectionSpec");
 print(jdbcSpec);


6- Create a new JDBC data source:

 a- Create a DataSource with a specified Pool
 foam.dao.jdbc.JDBCPooledDataSource source = new foam.dao.jdbc.JDBCPooledDataSource(x, "PoolA");

 b- Or create a pool with a default name:
 foam.dao.jdbc.JDBCPooledDataSource source = new foam.dao.jdbc.JDBCPooledDataSource(x);


7- Create a sub-context for the JDBC DAO:

foam.core.X xcopy = x.put("JDBCDataSource", source);


8- Crerate a new JDBC DAO with the sub-context containing the data source:

 employeeJDBCDAO = new foam.dao.jdbc.MySQLDAO(xcopy, foam.dao.jdbc.TestEmployee.getOwnClassInfo());
 

9- To test the put() method:

 testObject = new foam.dao.jdbc.TestEmployee(23, "Sam", "King");
 employeeJDBCDAO.put(testObject);


10- To test the select() method:

 foam.dao.Sink sink = employeeJDBCDAO.select();
 print(sink);

 
11- A select() with a where() clause:

 obj1 = employeeJDBCDAO.where(foam.mlang.MLang.EQ(foam.dao.jdbc.TestEmployee.ID, 2)).select();


12- A selec() with an orderBy() clause:

 obj2 = employeeJDBCDAO.orderBy(foam.mlang.MLang.DESC(foam.dao.jdbc.TestEmployee.ID)).select();


13- A select with limit() and skip():

 obj3 = employeeJDBCDAO.orderBy(foam.mlang.MLang.DESC(foam.dao.jdbc.TestEmployee.ID)).skip(1).select_(xcopy, new foam.dao.ArraySink(), 1, -1, null, null);
 print(obj3);

 obj4 = employeeJDBCDAO.orderBy(foam.mlang.MLang.DESC(foam.dao.jdbc.TestEmployee.ID)).limit(1).skip(1).select_(xcopy, new foam.dao.ArraySink(), 1, -1, null, null);
 print(obj4);


12- To test find() and remove():

 obj = employeeJDBCDAO.find_(x, "23");
 print(obj);
 employeeJDBCDAO.remove(obj);


13- Another example using foreign keys:


 foam.dao.jdbc.JDBCPooledDataSource source = new foam.dao.jdbc.JDBCPooledDataSource(x);
 foam.core.X xcopy = x.put("JDBCDataSource", source);
  
 companyJDBCDAO = new foam.dao.jdbc.MySQLDAO(xcopy, foam.dao.jdbc.TestCompany.getOwnClassInfo());
 employeeJDBCDAO = new foam.dao.jdbc.MySQLDAO(xcopy, foam.dao.jdbc.TestEmployee.getOwnClassInfo());

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
