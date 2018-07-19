/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mlang;

import foam.core.ClassInfo;
import foam.dao.Sink;
import foam.mlang.predicate.*;
import foam.mlang.sink.*;
import java.lang.reflect.InvocationTargetException;

/**
 * Static helper functions for creating MLangs.
 *
 * Usage: import foam.mlang.MLang.*;
 */
public class MLang
{
  public static final Predicate TRUE  = new True();
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

  public static Sink GROUP_BY(Expr o1, Sink o2) {
    GroupBy groupBy = new GroupBy();
    groupBy.setArg1(o1);
    groupBy.setArg2(o2);
    return groupBy;
  }

  public static Sink COUNT() {
    return new Count();
  }

  public static Predicate OR(Predicate... args) {
    return new Or(args);
  }

  public static Predicate NOT(Predicate predicate) {
    return new Not(predicate);
  }

  public static Sink MAX(Object o1) {
    return new Max(null, MLang.prepare(o1));
  }

  public static Sink MIN(Object o1) {
    return new Min(null, MLang.prepare(o1));
  }

  public static Sink SUM(Object o1) {
    return new Sum(MLang.prepare(o1), 0.0);
  }

  public static Sink MAP(Object o1, foam.dao.Sink delegate) {
    return new Map(MLang.prepare(o1), delegate);
  }

  public static Predicate INSTANCE_OF(ClassInfo info) {
    return new IsInstanceOf(info);
  }

  public static Predicate INSTANCE_OF(Class cls) {
    try {
      return INSTANCE_OF((ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null));
    } catch(NoSuchMethodException|IllegalAccessException|InvocationTargetException e) {
      throw new RuntimeException("Attempt to call INSTANCE_OF on non Modelled class." + cls);
    }
  }
}
