/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import java.util.Date;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;
import foam.mlang.Constant;
import foam.mlang.Expr;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Eq;
import foam.mlang.predicate.Or;

public class EqualsParser extends foam.lib.parse.ProxyParser {

  public EqualsParser() {
    setDelegate(new Seq(new FieldName(), 
                        new Alt(new Literal(":"), 
                                new Literal("=")), 
                        new ValueList() ));
  }
  
  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;

    Object[] values = (Object[]) ps.value();

    if ( ( (foam.core.PropertyInfo) values[0] ).getSQLType().equalsIgnoreCase("DATE")
        && values[2] instanceof Constant ) {// in long case that need to be cast
                                            // to date.

      Date[] dts = new YYYYMMDDLiteralDateParser().getDates(new Object[] { ( (Constant) values[2] ).getValue() });
      values[2] = new Constant[] { new foam.mlang.Constant(dts[0]), new foam.mlang.Constant(dts[1]) };
    }

    foam.mlang.Expr arg1 = (foam.mlang.Expr) values[0];

    if ( values[2] instanceof Constant[] || ((Object[])values[2])[0] instanceof Constant[]) {// in date case
      
      
      Constant[] val = (Constant[]) ( values[2] instanceof Constant[]? values[2]:((Object[])values[2])[0] );

      foam.mlang.predicate.Binary predicateGte = new foam.mlang.predicate.Gte();
      foam.mlang.predicate.Binary predicateLte = new foam.mlang.predicate.Lte();

      foam.mlang.Expr d1 = (foam.mlang.Expr) val[0];
      foam.mlang.Expr d2 = (foam.mlang.Expr) val[1];

      predicateGte.setArg1(arg1);
      predicateGte.setArg2(d1);

      predicateLte.setArg1(arg1);
      predicateLte.setArg2(d2);

      foam.mlang.predicate.Binary[] predicates = { predicateGte, predicateLte };

      And predicateAnd = new foam.mlang.predicate.And();
      predicateAnd.setArgs(predicates);

      return ps.setValue(predicateAnd);
    }

    foam.mlang.predicate.Binary predicate = values[1].equals("=") ? new foam.mlang.predicate.Eq()
        : new foam.mlang.predicate.Contains();

    foam.mlang.Expr arg2 = null;

    if ( values[2] instanceof Object[] && ((Object[])values[2]).length>1 ) {
      Or innerPredicate = new foam.mlang.predicate.Or();

      foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[( (Object[]) values[2] ).length];
      for ( int i = 0; i < args.length; i++ ) {
        Eq eq = new foam.mlang.predicate.Eq();
        eq.setArg1(arg1);
        eq.setArg2((Expr) ( (Object[]) values[2] )[i]);
        args[i] = eq;
      }
      innerPredicate.setArgs(args);

      return ps.setValue(innerPredicate);
    }else {
       arg2 = (foam.mlang.Expr) ((Object[])values[2])[0];
       
       predicate.setArg1(arg1);
       predicate.setArg2(arg2);
    }
    return ps.setValue(predicate);
  }
}
