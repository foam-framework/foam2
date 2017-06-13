package foam.dao;

import foam.core.FObject;

import java.sql.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PostgresDAO extends ProxyDAO {

    public PostgresDAO(DAO delegate, String host, String port, String dbName, String username, String password) {
        setDelegate(delegate);

        if (dbName == null || username == null) {
            throw new IllegalArgumentException("Illegal arguments");
        }

        host = (host != null) ? host : "localhost";
        port = (port != null) ? port : "5432";

        PgConnectionPool.setup(host, port, dbName, username, password);
    }

//    @Override
//    public FObject find(Object o) {
//        Field f = ((FObject) o).getClassInfo().get
//
//        Object value = ((PropertyInfo) f.get(o)).get(o);
//
//        try {
//            SQLData data = new SQLData(((FObject) o));
//            Connection c = PgConnectionPool.getConnection();
//
//            //TODO(drish)
//            String sql = "select * from " + data.getTableName();
//            sql += " where id=?";
//
//            System.out.println(data.getTableName());
//            System.out.println(data.getValues());
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//        return null;
//    }

    @Override
    public FObject put(FObject obj) {

        try {
            Connection c = PgConnectionPool.getConnection();

            // updating existing one
            // when FObject isIdSet is null it returns 0 , is it ok ?
            if ((Long) obj.getProperty("id") != 0) {
                SQLData data = new SQLData(obj);
                PreparedStatement smt = c.prepareStatement(data.createUpdateStatement());

                // put data into statement preserving order.
                int i = 1;
                for (Object value: data.getValues()) {
                    smt.setObject(i, value);
                    i++;
                }

                int inserted = smt.executeUpdate();
                if (inserted == 0) {
                    throw new SQLException("Error while inserting.");
                }

                smt.close();

            // inserting new one
            } else {
                SQLData data = new SQLData(obj);
                PreparedStatement smt = c.prepareStatement(data.createInsertStatement(),
                        Statement.RETURN_GENERATED_KEYS);

                // put data into statement preserving order.
                int i = 1;
                for (Object key: data.getValues()) {
                    smt.setObject(i, key);
                    i++;
                }

                int inserted = smt.executeUpdate();
                if (inserted == 0) {
                    throw new SQLException("Error while inserting.");
                }

                // get auto-generated postgres keys
                ResultSet generatedKeys = smt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    long pgKey = generatedKeys.getLong(1);
                    obj.setProperty("id", pgKey);
                } else {
                    throw new SQLException("Error while inserting: no ID returned");
                }

                smt.close();
            }

        c.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (getDelegate() != null) return getDelegate().put(obj);
        return obj;
    }

    /**
     * pluralize a word
     *
     * @param val
     * @return
     */
    public String pluralize(String val) {
        return null;
    }
}
