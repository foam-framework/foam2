/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mlang;

import foam.core.ContextAware;
import foam.core.X;

public class ContextualizingExpr extends ProxyExpr {
  private final X x_;

  public ContextualizingExpr(X x, Expr delegate) {
    super(delegate);
    x_ = x;
  }

  public X getX() {
    return x_;
  }

  @Override
  public Object f(Object obj) {
    var result = super.f(obj);
    if ( result instanceof ContextAware ) ((ContextAware) result).setX(getX());
    return result;
  }
}
