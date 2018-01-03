/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mlang;

import foam.dao.Sink;
import foam.mlang.predicate.*;
import foam.mlang.sink.*;

/**
 * Static helper functions for creating MLangs.
 *
 * Usage: import foam.mlang.MLang.*;
 */
public class MLang
{
  public static final Predicate TRUE = new True();
  public static final Predicate FALSE = new False();

  public static Expr prepare(Object o) {
    return o instanceof Expr ? (Expr) o :
        o instanceof Object[] ? new ArrayConstant((Object[]) o) :
        new Constant(o);
  }

  public static Predicate LT(Object o1, Object o2) {
    return new Lt(MLang.prepare(o1), MLang.prepare(o2));
  }

  public static Predicate LTE(Object o1, Object o2) {
    return new Lte(MLang.prepare(o1), MLang.prepare(o2));
  }

  public static Predicate EQ(Object o1, Object o2) {
    return new Eq(MLang.prepare(o1), MLang.prepare(o2));
  }

  public static Predicate NEQ(Object o1, Object o2) {
    return new Neq(MLang.prepare(o1), MLang.prepare(o2));
  }

  public static Predicate GTE(Object o1, Object o2) {
    return new Gte(MLang.prepare(o1), MLang.prepare(o2));
  }

  public static Predicate GT(Object o1, Object o2) {
    return new Gt(MLang.prepare(o1), MLang.prepare(o2));
  }

  public static Predicate IN(Object o1, Object o2) {
    return new In(MLang.prepare(o1), MLang.prepare(o2));
  }

  public static Predicate AND(Predicate... args) {
    return new And(args);
  }

  public static Predicate OR(Predicate... args) {
    return new Or(args);
  }

  public static Predicate NOT(Predicate predicate) {
    return new Not(predicate);
  }

  public static Sink MAX(Object o1) {
    return new Max(0, MLang.prepare(o1));
  }

  public static Sink MIN(Object o1) {
    return new Min(0, MLang.prepare(o1));
  }

  public static Sink SUM(Object o1) {
    return new Sum(MLang.prepare(o1), 0.0);
  }

  public static Sink MAP(Object o1, foam.dao.Sink delegate) {
    return new Map(MLang.prepare(o1), delegate);
  }
}
