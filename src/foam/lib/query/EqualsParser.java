/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq1;
import foam.mlang.Constant;
import foam.mlang.predicate.And;

public class EqualsParser extends foam.lib.parse.ProxyParser {

  public EqualsParser(Parser valueParser) {
    setDelegate(new Seq1(1,
                        new Literal("="),
                        new Alt(new ValueList(valueParser),
                        valueParser)));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse( ps, x );
    if ( ps == null ) return ps;

    if ( ps.value() instanceof Constant[] ) {

      foam.mlang.predicate.Binary predicateGte = new foam.mlang.predicate.Gte();
      foam.mlang.predicate.Binary predicateLte = new foam.mlang.predicate.Lte();

      foam.mlang.Expr d1 = ( foam.mlang.Expr ) ((Object[]) ps.value())[0];
      foam.mlang.Expr d2 = ( foam.mlang.Expr ) ((Object[]) ps.value())[1];

      predicateGte.setArg1(( foam.mlang.Expr ) x.get("arg1"));
      predicateGte.setArg2( d1 );

      predicateLte.setArg1(( foam.mlang.Expr ) x.get("arg1"));
      predicateLte.setArg2( d2 );

      foam.mlang.predicate.Binary[] predicates = { predicateGte, predicateLte };

      And predicateAnd = new foam.mlang.predicate.And();
      predicateAnd.setArgs(predicates);

      return ps.setValue(predicateAnd);
    }else if ( ps.value() instanceof Object[] && ((Object[]) ps.value()).length>1 ) {
      foam.mlang.predicate.Or innerPredicate = new foam.mlang.predicate.Or();

      foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[((Object[]) ps.value()).length];
      for ( int i = 0; i < args.length; i++ ) {
        foam.mlang.predicate.Eq eq = new foam.mlang.predicate.Eq();
        eq.setArg1(( foam.mlang.Expr ) x.get("arg1"));
        eq.setArg2(( ((Object[]) ps.value ())[i] instanceof foam.mlang.Expr ) ?
         ( foam.mlang.Expr ) ((Object[]) ps.value())[i] : new foam.mlang.Constant (((Object[]) ps.value())[i]));
        args[i] = eq;
      }
      innerPredicate.setArgs(args);

      return ps.setValue(innerPredicate);
    }

    foam.mlang.predicate.Binary expr = new foam.mlang.predicate.Eq();
    expr.setArg1((foam.mlang.Expr) x.get("arg1"));
    expr.setArg2(
        ( ps.value() instanceof foam.mlang.Expr ) ? (foam.mlang.Expr) ps.value() : new foam.mlang.Constant(ps.value()));

    return ps.setValue(expr);
  }
}
