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

  public static Expr prepare(Object o) {
    if ( o instanceof Expr )
      return (Expr) o;
    Constant constant = new Constant();
    constant.setValue(o);
    return constant;
  }

  public static Predicate LT(Object o1, Object o2) {
    Lt lt = new Lt();
    lt.setArg1(MLang.prepare(o1));
    lt.setArg2(MLang.prepare(o2));
    return lt;
  }

  public static Predicate LTE(Object o1, Object o2) {
    Lte lte = new Lte();
    lte.setArg1(MLang.prepare(o1));
    lte.setArg2(MLang.prepare(o2));
    return lte;
  }

  public static Predicate EQ(Object o1, Object o2) {
    Eq eq = new Eq();
    eq.setArg1(MLang.prepare(o1));
    eq.setArg2(MLang.prepare(o2));
    return eq;
  }

  public static Predicate GTE(Object o1, Object o2) {
    Gte gte = new Gte();
    gte.setArg1(MLang.prepare(o1));
    gte.setArg2(MLang.prepare(o2));
    return gte;
  }

  public static Predicate GT(Object o1, Object o2) {
    Gt gt = new Gt();
    gt.setArg1(MLang.prepare(o1));
    gt.setArg2(MLang.prepare(o2));
    return gt;
  }

  public static Predicate AND(Predicate... args) {
    And and = new And();
    and.setArgs(args);
    return and;
  }

  public static Predicate OR(Predicate... args) {
    Or or = new Or();
    or.setArgs(args);
    return or;
  }

  public static Sink MAX(Object o1) {
    Max max = new Max();
    max.setArg1(MLang.prepare(o1));
    return max;
  }

  public static Sink MIN(Object o1) {
    Min min = new Min();
    min.setArg1(MLang.prepare(o1));
    return min;
  }
}
