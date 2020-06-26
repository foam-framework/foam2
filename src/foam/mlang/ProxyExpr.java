/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mlang;

import foam.core.X;
import foam.dao.jdbc.IndexedPreparedStatement;

import java.sql.SQLException;

public class ProxyExpr implements Expr {
  private final Expr delegate_;

  public ProxyExpr(Expr delegate) {
    delegate_ = delegate;
  }

  public Expr getDelegate() {
    return delegate_;
  }

  @Override
  public Expr partialEval() {
    return delegate_.partialEval();
  }

  @Override
  public void authorize(X x) {
    delegate_.authorize(x);
  }

  @Override
  public Object f(Object obj) {
    return delegate_.f(obj);
  }

  @Override
  public String createStatement() {
    return delegate_.createStatement();
  }

  @Override
  public void prepareStatement(IndexedPreparedStatement stmt) throws SQLException {
    delegate_.prepareStatement(stmt);
  }
}
