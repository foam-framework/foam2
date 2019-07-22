
To test the JDBCDAO functionality:

1- Add the following declaration to the services.jrl file:
p({"class":"foam.nanos.boot.NSpec", "name":"JDBCConnectionSpec", "lazy":false, "serve":false, "class":"foam.nanos.boot.NSpec", "service":{"class":"foam.dao.JDBCConnectionSpec", "databaseServer":"mysql", "hostName":"localhost", "databaseName":"testSQLDAO", "userName":"foam_user", "userPassword":"foam_password"} })

2- Add a declaration to the JDBC connector, for example in gradle:
  compile "mysql:mysql-connector-java:8.0.16"

  
