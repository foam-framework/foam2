/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mlang;

import foam.core.ClassInfo;
import foam.core.X;
import foam.dao.Sink;
import foam.mlang.expr.*;
import foam.mlang.order.Comparator;
import foam.mlang.order.Desc;
import foam.mlang.predicate.*;
import foam.mlang.sink.*;
import foam.nanos.auth.Authorizer;

import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;

/**
 * Static helper functions for creating MLangs.
 *
 * Usage: import foam.mlang.MLang.*;
 */
public class MLang
{
  public static final Predicate TRUE  = new True();
  public static final Predicate FALSE = new False();

  public static final Expr NEW_OBJ    = new ContextObject("NEW");
  public static final Expr OLD_OBJ    = new ContextObject("OLD");

  public static Comparator DESC(Comparator c) {
    return new Desc(c);
  }

  public static Expr prepare(Object o) {
    return o instanceof Expr ? (Expr) o :
        o instanceof Object[] ? new ArrayConstant((Object[]) o) :
        new Constant(o);
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

  public static Predicate NEQ(Object o1, Object o2) {
    Neq neq = new Neq();
    neq.setArg1(MLang.prepare(o1));
    neq.setArg2(MLang.prepare(o2));
    return neq;
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

  public static Predicate IN(Object o1, Object o2) {
    In in = new In();
    in.setArg1(MLang.prepare(o1));
    in.setArg2(MLang.prepare(o2));
    return in;
  }

  public static Predicate AND(Predicate... args) {
    And and = new And();
    and.setArgs(args);
    return and;
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
    Or or = new Or();
    or.setArgs(args);
    return or;
  }

  public static Predicate NOT(Predicate predicate) {
    Not not = new Not();
    not.setArg1(predicate);
    return not;
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

  public static Sink SUM(Object o1) {
    Sum sum = new Sum();
    sum.setArg1(MLang.prepare(o1));
    sum.setValue(0.0);
    return sum;
  }

  public static Sink MAP(Object o1, foam.dao.Sink delegate) {
    Map map = new Map();
    map.setArg1(MLang.prepare(o1));
    map.setDelegate(delegate);
    return map;
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

  public static Expr DOT(Expr o1, Expr o2) {
    Dot dot = new Dot();
    dot.setArg1(o1);
    dot.setArg2(o2);
    return dot;
  }

  public static Expr DOT(Expr o1, Predicate o2) {
    Dot dot = new Dot();
    dot.setArg1(o1);
    dot.setArg2(new PredicatedExpr(o2));
    return dot;
  }

  public static Predicate CLASS_OF(ClassInfo info) {
    return new IsClassOf(info);
  }

  public static Predicate CLASS_OF(Class cls) {
    try {
      return CLASS_OF((ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null));
    } catch(NoSuchMethodException|IllegalAccessException|InvocationTargetException e) {
      throw new RuntimeException("Attempt to call CLASS_OF on non Modelled class." + cls);
    }
  }

  public static Predicate CONTAINS_IC(Object o1, Object o2) {
    ContainsIC containsIC = new ContainsIC();
    containsIC.setArg1(MLang.prepare(o1));
    containsIC.setArg2(MLang.prepare(o2));
    return containsIC;
  }

  public static Predicate CONTAINS(Object o1, Object o2) {
    Contains contains = new Contains();
    contains.setArg1(MLang.prepare(o1));
    contains.setArg2(MLang.prepare(o2));
    return contains;
  }

  public static Predicate HAS(Object o) {
    Has has = new Has();
    has.setArg1(MLang.prepare(o));
    return has;
  }

  // used by AuthenticatedDAO
  public static Predicate HAS_PERMISSION(X userContext, Boolean remove, String permissionPrefix) {
    return remove? IS_AUTHORIZED_TO_DELETE(userContext, new foam.nanos.auth.StandardAuthorizer(permissionPrefix))
      : IS_AUTHORIZED_TO_READ(userContext, new foam.nanos.auth.StandardAuthorizer(permissionPrefix));
  }

  // used by AuthorizationDAO
  public static Predicate IS_AUTHORIZED_TO_READ(X userContext, Authorizer authorizer) {
    isAuthorizedToRead isAuthorizedToRead =new isAuthorizedToRead();
    isAuthorizedToRead.setUserContext(userContext);
    isAuthorizedToRead.setAuthorizer(authorizer);
    return isAuthorizedToRead;
  }
  public static Predicate IS_AUTHORIZED_TO_DELETE(X userContext, Authorizer authorizer) {
    isAuthorizedToDelete isAuthorizedToDelete = new isAuthorizedToDelete();
    isAuthorizedToDelete.setUserContext(userContext);
    isAuthorizedToDelete.setAuthorizer(authorizer);
    return isAuthorizedToDelete;
  }

  public static Predicate DOT_F(Object o1, Object o2) {
    DotF dotF = new DotF();
    dotF.setArg1(MLang.prepare(o1));
    dotF.setArg2(MLang.prepare(o2));
    return dotF;
  }

  public static Expr[] toExprArray(Object... args) {
    return Arrays.stream(args).map(MLang::prepare).toArray(Expr[]::new);
  }

  public static Expr ADD(Object arg1, Object arg2) {
    return prepareFormula(new Add(), arg1, arg2);
  }

  public static Expr SUB(Object arg1, Object arg2) {
    return prepareFormula(new Subtract(), arg1, arg2);
  }

  public static Expr MUL(Object arg1, Object arg2) {
    return prepareFormula(new Multiply(), arg1, arg2);
  }

  public static Expr DIV(Object arg1, Object arg2) {
    return prepareFormula(new Divide(), arg1, arg2);
  }

  public static Expr MIN_FUNC(Object arg1, Object arg2) {
    return prepareFormula(new MinFunc(), arg1, arg2);
  }

  public static Expr MAX_FUNC(Object arg1, Object arg2) {
    return prepareFormula(new MaxFunc(), arg1, arg2);
  }

  public static Expr prepareFormula(Formula formula, Object... args) {
    formula.setArgs(toExprArray(args));
    return formula;
  }
}
