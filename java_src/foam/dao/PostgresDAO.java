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
            SQLData data = new SQLData(obj);
            Connection c = PgConnectionPool.getConnection();

            StringBuilder sql = new StringBuilder("insert into " + data.getTableName());
            sql.append(data.getFormatedColumnNames());
            sql.append("values " + data.getFormatedPlaceholders());

            PreparedStatement smt = c.prepareStatement(sql.toString(), Statement.RETURN_GENERATED_KEYS);

            int i = 1;
            for (Object key: data.getValues().keySet()) {
                smt.setObject(i, data.getValues().get(key));
                i++;
            }

            System.out.println(smt.toString());
            int inserted = smt.executeUpdate();
            if (inserted == 0) {
                throw new SQLException("Error while inserting.");
            }

            // get auto-generated keys
            try (ResultSet generatedKeys = smt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    long pgKey = generatedKeys.getLong(1);
//                    setId(obj, pgKey);
                    System.out.println(pgKey);
                }
                else {
                    throw new SQLException("Error while inserting: no ID returned");
                }
            }

            ResultSet rs = smt.executeQuery();
            System.out.println(rs);
            smt.close();
            c.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (getDelegate() != null) return getDelegate().put(obj);
        return null;
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
