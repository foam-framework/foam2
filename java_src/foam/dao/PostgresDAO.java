package foam.dao;

import com.sun.istack.internal.NotNull;
import foam.core.FObject;
import foam.core.PropertyInfo;

import java.lang.reflect.Field;
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

    @Override
    public FObject put(FObject obj) {

        try {
            SQLData data = new SQLData(obj);
            Connection c = PgConnectionPool.getConnection();

            String sql = "insert into " + data.getTableName();
            sql += data.getFormatedColumnNames();
            sql += "values " + data.getFormatedPlaceholders();

            PreparedStatement smt = c.prepareStatement(sql);

            int i = 1;
            for (Object key: data.getValues().keySet()) {
                smt.setObject(i, data.getValues().get(key));
                i++;
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
