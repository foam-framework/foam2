/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.jdbc;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import java.sql.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

// TODO: Create AbstractJDBCDAO baseclass
public class PostgresDAO
  extends AbstractJDBCDAO
{
  protected ConnectionPool connectionPool = new ConnectionPool();
  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public PostgresDAO(X x, ClassInfo of) throws java.sql.SQLException, ClassNotFoundException {
    super(x, of);
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    sink = prepareSink(sink);

    Connection               c         = null;
    IndexedPreparedStatement stmt      = null;
    ResultSet                resultSet = null;

    try {
      c = connectionPool.getConnection();

      StringBuilder builder = sb.get()
          .append("select * from ")
          .append(tableName_);

      if ( predicate != null ) {
        builder.append(" where ")
            .append(predicate.createStatement());
      }

      if ( order != null ) {
        builder.append(" order by ")
            .append(order.createStatement());
      }

      if ( limit > 0 && limit < this.MAX_SAFE_INTEGER ) {
        builder.append(" limit ").append(limit);
      }

      if ( skip > 0 && skip < this.MAX_SAFE_INTEGER ) {
        builder.append(" offset ").append(skip);
      }

      stmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString()));

      if ( predicate != null ) {
        predicate.prepareStatement(stmt);
      }

      resultSet = stmt.executeQuery();
      while ( resultSet.next() ) {
        sink.put(createFObject(resultSet), null);
      }

      return sink;
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
      return null;
    } finally {
      closeAllQuietly(resultSet, stmt);
    }
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported operation: removeAll_");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Connection c = null;
    ResultSet resultSet = null;

    try {
      if ( insertStmt == null ) {
        c = connectionPool.getConnection();
        StringBuilder builder = sb.get()
                .append("insert into ")
                .append(tableName_);

        buildFormattedColumnNames(obj, builder);
        builder.append(" values");
        buildFormattedColumnPlaceholders(obj, builder);
        builder.append(" on conflict (")
                .append(getPrimaryKey().createStatement())
                .append(") do update set");
        buildFormattedColumnNames(obj, builder);
        builder.append(" = ");
        buildFormattedColumnPlaceholders(obj, builder);

        insertStmt = new IndexedPreparedStatement(c.prepareStatement(builder.toString(),
                Statement.RETURN_GENERATED_KEYS));
      }

      // set statement values twice: once for the insert and once for the update on conflict
      setStatementValues(insertStmt, obj);
      setStatementValues(insertStmt, obj);

      int inserted = insertStmt.executeUpdate();
      if ( inserted == 0 ) {
        throw new SQLException("Error performing put_ command");
      }

      // get auto-generated postgres keys
/*       resultSet = stmt.getGeneratedKeys();
      if ( resultSet.next() ) {
        obj.setProperty(getPrimaryKey().getName(), resultSet.getObject(1));
      } */

      return obj;
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
      return null;
    } finally {
      try {
        setStatementValues(insertStmt, null);
      } catch (SQLException e) {
        Logger logger = (Logger) x.get("logger");
        logger.error(e);
      }
      closeAllQuietly(resultSet, insertStmt);
    }
  }

}
