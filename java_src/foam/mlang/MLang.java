package foam.mlang;

import foam.mlang.predicate.*;

/**
 * Static helper functions for creating MLangs.
 *
 * Usage: import foam.mlang.MLang.*;
 */
public class MLang
{

  public static Expr prepare(Object o) {
    return o instanceof Expr ? (Expr) o : new Constant().setValue(o);
  }

  public static Predicate LT(Object o1, Object o2) {
    return new Lt().setArg1(MLang.prepare(o1)).setArg2(MLang.prepare(o2));
  }

  public static Predicate LTE(Object o1, Object o2) {
    return new Lte().setArg1(MLang.prepare(o1)).setArg2(MLang.prepare(o2));
  }

  public static Predicate EQ(Object o1, Object o2) {
    return new Eq().setArg1(MLang.prepare(o1)).setArg2(MLang.prepare(o2));
  }

  public static Predicate GTE(Object o1, Object o2) {
    return new Gte().setArg1(MLang.prepare(o1)).setArg2(MLang.prepare(o2));
  }

  public static Predicate GT(Object o1, Object o2) {
    return new Gt().setArg1(MLang.prepare(o1)).setArg2(MLang.prepare(o2));
  }

  public static Predicate AND(Predicate... args) {
    return new And().setArgs(args);
  }

  public static Predicate OR(Predicate... args) {
    return new Or().setArgs(args);
  }
}
