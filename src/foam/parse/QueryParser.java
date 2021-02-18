/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.core.ClassInfo;
import foam.core.PropertyInfo;
import foam.lib.json.AnyParser;
import foam.lib.json.IntParser;
import foam.lib.json.KeyParser;
import foam.lib.json.Whitespace;
import foam.lib.parse.*;
import foam.lib.query.*;
import foam.mlang.Constant;
import foam.mlang.Expr;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Eq;
import foam.mlang.predicate.Has;
import foam.mlang.predicate.Not;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;

import java.util.ArrayList;
import java.util.List;

public class QueryParser
{
  protected ClassInfo info_;

  public QueryParser(ClassInfo classInfo) {
    info_ = classInfo;

    List         properties  = classInfo.getAxiomsByClass(PropertyInfo.class);
    List<Parser> expressions = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      PropertyInfo info = (PropertyInfo) prop;

      expressions.add(PropertyExpressionParser.create(info));
      expressions.add(new NegateParser(PropertyExpressionParser.create(info)));
      expressions.add(new HasParser(info));
      expressions.add(new ParenParser(PropertyExpressionParser.create(info)));

      if ( info.getSQLType().equalsIgnoreCase("BOOLEAN") ) expressions.add(new IsParser(info));
    }

    expressions.add(new MeParser());
    expressions.add(new IsInstanceOfParser());

    Parser[] parsers = expressions.toArray(new Parser[expressions.size()]);
    Parser altParser = new Alt(parsers);

//    setDelegate(new Alt(
//      new ParenParser(new OrParser(new AndParser(altParser))),
//      new ParenParser(new OrParser(new ParenParser(new AndParser(altParser)))),
//      new OrParser(new AndParser(altParser))));
  }

  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return getGrammar().parse(ps, x, "");
  }

  private Grammar getGrammar() {
    Grammar grammar = new Grammar();

    // markup symbol defines the pattern for the whole string
    grammar.addSymbol("markup", grammar.sym("QUERY"));
    grammar.addSymbol("QUERY", grammar.sym("OR"));


    grammar.addSymbol("OR", new Repeat(grammar.sym("AND"),
      new Seq0(foam.lib.json.Whitespace.instance(),
        new Alt(new LiteralIC("OR "),
          Literal.create("| "))
      )));
    grammar.addAction("OR", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] values = (Object[])val;

        foam.mlang.predicate.Or or = new foam.mlang.predicate.Or();

        foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[values.length];

        for ( int i = 0 ; i < args.length ; i++ ) {
          args[i] = (foam.mlang.predicate.Predicate)values[i];
        }

        or.setArgs(args);
        return or;
      }
    });

    grammar.addSymbol("AND", new Repeat(grammar.sym("EXPR"),
      new LiteralIC("AND ")));
    grammar.addAction("AND", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        foam.mlang.predicate.And and = new foam.mlang.predicate.And();

        Object[] values = (Object[]) val;

        foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[values.length];

        for ( int i = 0 ; i < values.length ; i++ ) {
          args[i] = (foam.mlang.predicate.Predicate) values[i];
        }

        and.setArgs(args);
        return and;
      }
    });

    grammar.addSymbol("EXPR", new Alt(grammar.sym("PAREN"),
      grammar.sym("NEGATE"), grammar.sym("HAS"), grammar.sym("IS"), grammar.sym("EQUALS"),
      grammar.sym("BEFORE"), grammar.sym("AFTER"), grammar.sym("ID")));

    grammar.addSymbol("PAREN", new Seq1(1,
      Literal.create("("),
      grammar.sym("QUERY"),
      Literal.create(")")));

    grammar.addSymbol("NEGATE", new Alt(new Seq1(1,Literal.create("-"),
      grammar.sym("EXPR")),
      new Seq1(1,new LiteralIC("NOT "),
        grammar.sym("EXPR"))));
    grammar.addAction("NEGATE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Not predicate = new Not();
        predicate.setArg1((foam.mlang.predicate.Binary) val);
        return predicate;
      }
    });

    grammar.addSymbol("ID", new Seq1(7,
      Whitespace.instance(),
      Literal.create("{"),
      Whitespace.instance(),
      new KeyParser("id"),
      Whitespace.instance(),
      Literal.create(":"),
      Whitespace.instance(),
      AnyParser.instance(),
      Whitespace.instance(),
      Literal.create("}")
    ));
    grammar.addAction("ID", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Eq predicate = new Eq();
        predicate.setArg1((PropertyInfo) info_.getAxiomByName("ID"));
        predicate.setArg2((Expr) val);
        return predicate;
      }
    });

    grammar.addSymbol("HAS", new Seq(Literal.create("has:"),
      grammar.sym("FIELD_NAME")));
    grammar.addAction("HAS", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] values = (Object[]) val;
        Has predicate = new foam.mlang.predicate.Has();
        predicate.setArg1((PropertyInfo) values[1]);
        return predicate;
      }
    });

    grammar.addSymbol("IS", new Seq(Literal.create("is:"), grammar.sym("FIELD_NAME")));
    grammar.addAction("IS", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        PropertyInfo[] values = (PropertyInfo[]) val;
        foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Eq ();
        predicate.setArg1(values[1]);
        predicate.setArg2(new foam.mlang.Constant(true));
        return predicate;
      }
    });

    grammar.addSymbol("EQUALS", new Seq1(1,
      grammar.sym("FIELD_NAME"),
      new Alt(Literal.create(":"), Literal.create("=")),
      grammar.sym("VALUE_LIST")
      )
    );
    grammar.addAction("EQUALS", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        if ( val instanceof Constant[] ) {
          Object[] values = (Object[]) val;
          foam.mlang.predicate.Binary predicateGte = new foam.mlang.predicate.Gte();
          foam.mlang.predicate.Binary predicateLte = new foam.mlang.predicate.Lte();

          foam.mlang.Expr d1 = ( foam.mlang.Expr ) values[0];
          foam.mlang.Expr d2 = ( foam.mlang.Expr ) values[1];

          predicateGte.setArg1(( foam.mlang.Expr ) x.get("arg1"));
          predicateGte.setArg2( d1 );

          predicateLte.setArg1(( foam.mlang.Expr ) x.get("arg1"));
          predicateLte.setArg2( d2 );

          foam.mlang.predicate.Binary[] predicates = { predicateGte, predicateLte };

          And predicateAnd = new foam.mlang.predicate.And();
          predicateAnd.setArgs(predicates);

          return predicateAnd;
        }else if ( val instanceof Object[] && ((Object[]) val).length>1 ) {
          foam.mlang.predicate.Or innerPredicate = new foam.mlang.predicate.Or();

          foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[((Object[]) val).length];
          for ( int i = 0; i < args.length; i++ ) {
            foam.mlang.predicate.Eq eq = new foam.mlang.predicate.Eq();
            eq.setArg1(( foam.mlang.Expr ) x.get("arg1"));
            eq.setArg2(( ((Object[]) val)[i] instanceof foam.mlang.Expr ) ?
              ( foam.mlang.Expr ) ((Object[]) val)[i] : new foam.mlang.Constant (((Object[]) val)[i]));
            args[i] = eq;
          }
          innerPredicate.setArgs(args);

          return innerPredicate;
        }

        foam.mlang.predicate.Binary expr = new foam.mlang.predicate.Eq();
        expr.setArg1((foam.mlang.Expr) x.get("arg1"));
        expr.setArg2(
          ( val instanceof foam.mlang.Expr ) ? (foam.mlang.Expr) val : new foam.mlang.Constant(val));

        return expr;
      }
    });

    grammar.addSymbol("BEFORE", new Seq(
      grammar.sym("FIELD_NAME"),
      new Alt(Literal.create("<="), Literal.create("<"),
        new LiteralIC("-before:")),
      grammar.sym("VALUE")));
    grammar.addAction("BEFORE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Lte();
        predicate.setArg1((foam.mlang.Expr) x.get("arg1"));

        predicate
          .setArg2((val instanceof foam.mlang.Expr) ? (foam.mlang.Expr) val :
            new foam.mlang.Constant(val));

        return predicate;
      }
    });

    grammar.addSymbol("AFTER", new Seq(
      grammar.sym("FIELD_NAME"),
      new Alt(Literal.create(">="), Literal.create(">"),
        new LiteralIC("-after:")),
      grammar.sym("VALUE")
    ));
    grammar.addAction("AFTER", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Gte();
        predicate.setArg1(( foam.mlang.Expr ) x.get( "arg1" ));

        predicate
          .setArg2(( val instanceof foam.mlang.Expr ) ? (foam.mlang.Expr) val : new foam.mlang.Constant(val));

        return predicate;
      }
    });

    grammar.addSymbol("VALUE", new Alt(grammar.sym("ME"),
      grammar.sym("DATE"), grammar.sym("STRING"), grammar.sym("NUMBER")));

    grammar.addSymbol("COMPOUND_VALUE", new Alt(grammar.sym("NEGATE_VALUE"),
      grammar.sym("OR_VALUE"), grammar.sym("AND_VALUE")));

    grammar.addSymbol("NEGATE_VALUE", new Seq(Literal.create("("),
      new Alt(Literal.create("-"), new LiteralIC("not")),
      grammar.sym("VALUE"), Literal.create(")")));
    grammar.addAction("NEGATE_VALUE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        //TODO
        return null;
      }
    });

    grammar.addSymbol("OR_VALUE", new Seq(
      Literal.create("("),
      new Repeat(
          grammar.sym("VALUE"),
          new Alt(Literal.create("|"), new LiteralIC(" or "), Literal.create("|"))
        ),
      Literal.create(")")
    ));
    grammar.addAction("OR_VALUE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] values = (Object[]) val;
        Object[] args = new Object[( (Object[]) values[1] ).length];
        for ( int i = 0; i < args.length; i++ ) {
          args[i] = ( (Object[]) values[1] )[i];
        }

        return args;
      }
    });

    grammar.addSymbol("AND_VALUE", new Seq(
      Literal.create("("),
      new Repeat(
        grammar.sym("VALUE"),
        new Alt(Literal.create("|"), new LiteralIC(" and "), Literal.create("|"))
      ),
      Literal.create(")")
    ));
    grammar.addAction("AND_VALUE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        //TODO: parser n avalues
        return null;
      }
    });

    grammar.addSymbol("VALUE_LIST", new Alt(
      grammar.sym("COMPOUND_VALUE"),
      new Repeat(grammar.sym("VALUE"), Literal.create(","))
    ));

    grammar.addSymbol("ME", new Seq(
      new LiteralIC("me"),
      new foam.lib.parse.Not(grammar.sym("char"))
    ));
    grammar.addAction("ME", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        if ( ( (Object[]) val )[0].equals("me") ) {
          User user = ((Subject) x.get("subject")).getUser();
          if ( user == null ) {
            System.err.println("User is not logged in");
            return null;
          }
          return user.getId();
        }
        return null;
      }
    });

    grammar.addSymbol("DATE", new Alt(
      grammar.sym("RANGE_DATE"),
      grammar.sym("LITERAL_DATE"),
      grammar.sym("RELATIVE_DATE")
    ));

    grammar.addSymbol("RANGE_DATE", new Seq(
      new Alt(grammar.sym("LITERAL_DATE"), grammar.sym("NUMBER")),
      Literal.create(".."),
      new Alt(grammar.sym("LITERAL_DATE"), grammar.sym("NUMBER"))
    ));

    return grammar;
  }
}
