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
    return new Lt.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setArg2(MLang.prepare(o2))
      .build();
  }

  public static Predicate LTE(Object o1, Object o2) {
    return new Lte.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setArg2(MLang.prepare(o2))
      .build();
  }

  public static Predicate EQ(Object o1, Object o2) {
    return new Eq.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setArg2(MLang.prepare(o2))
      .build();
  }

  public static Predicate NEQ(Object o1, Object o2) {
    return new Neq.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setArg2(MLang.prepare(o2))
      .build();
  }

  public static Predicate GTE(Object o1, Object o2) {
    return new Gte.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setArg2(MLang.prepare(o2))
      .build();
  }

  public static Predicate GT(Object o1, Object o2) {
    return new Gt.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setArg2(MLang.prepare(o2))
      .build();
  }

  public static Predicate IN(Object o1, Object o2) {
    return new In.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setArg2(MLang.prepare(o2))
      .build();
  }

  public static Predicate AND(Predicate... args) {
    return new And.Builder(null)
      .setArgs(args)
      .build();
  }

  public static Sink GROUP_BY(Expr o1, Sink o2) {
    return new GroupBy.Builder(null)
      .setArg1(o1)
      .setArg2(o2)
      .build();
  }

  public static Sink COUNT() {
    return new Count();
  }

  public static Predicate OR(Predicate... args) {
    return new Or.Builder(null)
      .setArgs(args)
      .build();
  }

  public static Predicate NOT(Predicate predicate) {
    return new Not.Builder(null)
      .setArg1(predicate)
      .build();
  }

  public static Sink MAX(Object o1) {
    return new Max.Builder(null)
      .setArg1(MLang.prepare(o1))
      .build();
  }

  public static Sink MIN(Object o1) {
    return new Min.Builder(null)
      .setArg1(MLang.prepare(o1))
      .build();
  }

  public static Sink SUM(Object o1) {
    return new Sum.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setValue(0.0)
      .build();
  }

  public static Sink MAP(Object o1, foam.dao.Sink delegate) {
    return new Map.Builder(null)
      .setArg1(MLang.prepare(o1))
      .setDelegate(delegate)
      .build();
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
