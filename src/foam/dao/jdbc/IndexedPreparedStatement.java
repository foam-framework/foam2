package foam.dao.jdbc;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class IndexedPreparedStatement
{

  protected int index_;
  protected PreparedStatement delegate_;

  public IndexedPreparedStatement(PreparedStatement delegate) {
    this(1, delegate);
  }

  public IndexedPreparedStatement(int index, PreparedStatement delegate) {
    this.index_ = index;
    this.delegate_ = delegate;
  }

  public void setDelegate_(PreparedStatement delegate_) {
    this.delegate_ = delegate_;
  }

  public void close() throws SQLException {
    delegate_.close();
  }

  public ResultSet executeQuery() throws SQLException {
    return delegate_.executeQuery();
  }

  public int executeUpdate() throws SQLException {
    return delegate_.executeUpdate();
  }

  public ResultSet getGeneratedKeys() throws SQLException {
    return delegate_.getGeneratedKeys();
  }

  public void setLong(long x) throws SQLException {
    delegate_.setLong(index_++, x);
  }

  public void setObject(Object x) throws SQLException {
    if ( x instanceof java.util.Date ) {
      delegate_.setObject(index_++, x, java.sql.Types.TIMESTAMP);
    } else {
      delegate_.setObject(index_++, x);
    }
  }
}
