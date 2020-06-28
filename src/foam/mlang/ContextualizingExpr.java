/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mlang;

import foam.core.X;

import static foam.core.ContextAware.maybeContextualize;

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
    return maybeContextualize(getX(), super.f(obj));
  }
}
