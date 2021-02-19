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
import foam.util.SafetyUtil;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class QueryParser
{
  protected ClassInfo info_;
  protected List<Parser> expressions;

  public QueryParser(ClassInfo classInfo) {
    info_ = classInfo;

    List<PropertyInfo>         properties  = classInfo.getAxiomsByClass(PropertyInfo.class);
    expressions = new ArrayList();

    for ( PropertyInfo prop : properties ) {
      expressions.add(new LiteralIC(prop.getName(), prop));

      if ( ! SafetyUtil.isEmpty(prop.getShortName()) ) {
        expressions.add(new LiteralIC(prop.getShortName(), prop));
      }

      if ( prop.getAliases().length != 0 ) {
        for ( int i = 0; i < prop.getAliases().length; i++) {
          expressions.add(new LiteralIC(prop.getAliases()[0], prop));
        }
      }
    }

//    expressions.add(new MeParser());
//    expressions.add(new IsInstanceOfParser());
//
//    Parser[] parsers = expressions.toArray(new Parser[expressions.size()]);
//    Parser altParser = new Alt(parsers);

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
    grammar.addSymbol("START", grammar.sym("OR"));


    grammar.addSymbol("FIELD_NAME", new Alternate(expressions));

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

        Object[] valArr = (Object[]) val;

        foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[valArr.length];

        for ( int i = 0 ; i < valArr.length ; i++ ) {
          args[i] = (foam.mlang.predicate.Predicate) valArr[i];
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
      grammar.sym("OR"),
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

//    grammar.addSymbol("ID", new Seq1(7,
//      Whitespace.instance(),
//      Literal.create("{"),
//      Whitespace.instance(),
//      new KeyParser("id"),
//      Whitespace.instance(),
//      Literal.create(":"),
//      Whitespace.instance(),
//      AnyParser.instance(),
//      Whitespace.instance(),
//      Literal.create("}")
//    ));
    grammar.addSymbol("ID", grammar.sym("NUMBER"));
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

    grammar.addSymbol("EQUALS", new Seq2(0,2,
      grammar.sym("FIELD_NAME"),
      new Alt(Literal.create(":"), Literal.create("=")),
      grammar.sym("VALUE_LIST")
      )
    );
    grammar.addAction("EQUALS", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] values = (Object[]) val;
        Expr prop = ( foam.mlang.Expr ) values[0];
        foam.mlang.predicate.Binary expr = new foam.mlang.predicate.Eq();
        expr.setArg1(prop);
        expr.setArg2(
          ( val instanceof foam.mlang.Expr ) ? (foam.mlang.Expr) values[1] : new foam.mlang.Constant(values[1]));

        return expr;
      }
    });

    grammar.addSymbol("BEFORE", new Seq2(0, 2,
      grammar.sym("FIELD_NAME"),
      new Alt(Literal.create("<="), Literal.create("<"),
        new LiteralIC("-before:")),
      grammar.sym("VALUE")));
    grammar.addAction("BEFORE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] values = (Object[]) val;
        foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Lte();
        predicate.setArg1((foam.mlang.Expr) values[0]);

        predicate
          .setArg2((values[1] instanceof foam.mlang.Expr) ? (foam.mlang.Expr) values[1] :
            new foam.mlang.Constant(values[1]));

        return predicate;
      }
    });

    grammar.addSymbol("AFTER", new Seq2(0,2,
      grammar.sym("FIELD_NAME"),
      new Alt(Literal.create(">="), Literal.create(">"),
        new LiteralIC("-after:")),
      grammar.sym("VALUE")
    ));
    grammar.addAction("AFTER", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] values = (Object[]) val;
        foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Gte();
        predicate.setArg1(( foam.mlang.Expr ) values[0]);

        predicate
          .setArg2(( values[1] instanceof foam.mlang.Expr ) ? (foam.mlang.Expr) values[1] : new foam.mlang.Constant(values[1]));

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
        return val;
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
        return val;
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
            return val;
          }
          return user.getId();
        }
        return val;
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
    grammar.addAction("RANGE_DATE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] result = (Object[]) val;

        java.util.Calendar c = new java.util.GregorianCalendar();
        // d1..d2
        if (result.length > 10 && result[5].equals("..")) {
          Date date1 = null, date2 = null;
          c.set((Integer) result[0], (Integer) result[2] - 1, (Integer) result[4]);
          date1 = c.getTime();
          c.clear();
          c.set((Integer) result[6], (Integer) result[8] - 1, (Integer) result[10]);
          date2 = c.getTime();

          Date[] dates = new Date[]{date1, date2};
          return dates;
        }
        return val;
      }
    });

    grammar.addSymbol("LITERAL_DATE", new Alt(
      new Seq(
        grammar.sym("NUMBER"),
        Literal.create("-"),
        grammar.sym("NUMBER"),
        Literal.create("-"),
        grammar.sym("NUMBER"),
        Literal.create("T"),
        grammar.sym("NUMBER"),
        Literal.create(":"),
        grammar.sym("NUMBER")
      ),
      new Seq(
        grammar.sym("NUMBER"),
        Literal.create("-"),
        grammar.sym("NUMBER"),
        Literal.create("-"),
        grammar.sym("NUMBER"),
        Literal.create("T"),
        grammar.sym("NUMBER")
      ),
      new Seq(
        grammar.sym("NUMBER"),
        Literal.create("-"),
        grammar.sym("NUMBER"),
        Literal.create("-"),
        grammar.sym("NUMBER")
      ),
      new Seq(
        grammar.sym("NUMBER"),
        Literal.create("-"),
        grammar.sym("NUMBER")
      ),
      new Seq(
        grammar.sym("NUMBER"),
        Literal.create("/"),
        grammar.sym("NUMBER"),
        Literal.create("/"),
        grammar.sym("NUMBER")
      )
    ));
    grammar.addAction("LITERAL_DATE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        java.util.Calendar c = new java.util.GregorianCalendar();
        c.clear();

        Object[] result = (Object[]) val;

        c.set(
          result.length >  1 ? (Integer) result[0]     : 0,
          result.length >  3 ? (Integer) result[2] - 1 : 0,
          result.length >  5 ? (Integer) result[4]     : 0,
          result.length >  7 ? (Integer) result[6]     : 0,
          result.length >  9 ? (Integer) result[8]     : 0,
          result.length > 11 ? (Integer) result[10]    : 0);

        return c.getTime();
      }
    });

    grammar.addSymbol("RELATIVE_DATE", new Seq1(0,
      new LiteralIC("today"),
      new Optional(new Seq(
        Literal.create("-"), grammar.sym("NUMBER")
      ))
    ));
    grammar.addAction("RELATIVE_DATE", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        // example today or today-7 {today,"-",7}
        Object[] result = null;
        result = new Integer[6];
        result[0] = new java.util.GregorianCalendar().getInstance().get(Calendar.YEAR);
        result[2] = new java.util.GregorianCalendar().getInstance().get(Calendar.MONTH) + 1;
        result[4] = new java.util.GregorianCalendar().getInstance().get(Calendar.DAY_OF_MONTH);

        java.util.Calendar c = new java.util.GregorianCalendar();

        Date date1 = null, date2 = null;
        c.clear();

        c.set(
          result.length > 1 ? (Integer) result[0] : 0,
          result.length > 3 ? (Integer) result[2] - 1 : 0,
          result.length > 5 ? (Integer) result[4] : 0,
          result.length > 7 ? (Integer) result[6] : 0,
          result.length > 9 ? (Integer) result[8] : 0,
          result.length > 11 ? (Integer) result[10] : 0);
        date1 = c.getTime();
        c.clear();

        Date[] dates = null;
        // {today,"-",7}
        if (val instanceof Object[]
          && (((Object[]) val).length < 4 && ((Object[]) val)[0] instanceof String)) {
          c.set(
            result.length > 1 ? (Integer) result[0] + (result.length > 3 ? 0 : 1) : 0,
            result.length > 3 ? (Integer) result[2] - 1 + (result.length > 5 ? 0 : 1) : 0,//TODO -1
            result.length > 5 ? (Integer) result[4] - (Integer)((Object[]) val)[2] : 0//to include that date
          );
          date2 = c.getTime();
          dates = new Date[] { date2, date1 };
        } else {//today
          c.clear();
          c.set(
            result.length > 1 ? (Integer) result[0] + (result.length > 3 ? 0 : 1) : 0,
            result.length > 3 ? (Integer) result[2] - 1 + (result.length > 5 ? 0 : 1) : 0,
            result.length > 5 ? (Integer) result[4] + (result.length > 7 ? 0 : 1) : 0,
            result.length > 7 ? (Integer) result[6] + (result.length > 9 ? 0 : 1) : 0,
            result.length > 9 ? (Integer) result[8] + (result.length > 11 ? 0 : 1) : 0,
            result.length > 11 ? (Integer) result[10] + (result.length > 13 ? 0 : 1) : 0);
          date2 = c.getTime();
          dates = new Date[] { date1, date2 };
        }
        return dates;
      }
    });

    grammar.addSymbol("STRING", new Alt(
      grammar.sym("WORD"),
      grammar.sym("QUOTED_STRING")
    ));

    grammar.addSymbol("QUOTED_STRING", new Seq1(1,
      Literal.create("\""),
      new Repeat(new Alt(
        Literal.create("\\\""),
        Literal.create("\"")
      ), new NotChars("\""))
    ));
    grammar.addAction("QUOTED_STRING", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        return val;
      }
    });

    grammar.addSymbol("WORD", new Repeat(
      grammar.sym("CHAR")
    ));
    grammar.addAction("WORD", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        return joinChars(val);
      }
    });

    grammar.addSymbol("CHAR", new Alt(
      Range.create('a', 'z'),
      Range.create('A', 'Z'),
      Range.create('0', '9'),
      Literal.create("-"),
      Literal.create("^"),
      Literal.create("_"),
      Literal.create("@"),
      Literal.create("%"),
      Literal.create(".")
    ));

    grammar.addSymbol("NUMBER", new Repeat(
      Range.create('0', '9')
    ));
    grammar.addAction("NUMBER", new Action() {
      @Override
      public Object execute(Object val, ParserContext x) {
        Object[] values = (Object[]) val;
        if ( values.length == 0 ) return val;
        StringBuilder numberStr = new StringBuilder();
        for ( Object num: values ) {
          numberStr.append(num);
        }
        return Integer.parseInt(numberStr.toString());
      }
    });

    return grammar;
  }

  protected String joinChars(Object chars) {
    StringBuilder sb = new StringBuilder();
    for (Object ch: (Object[]) chars) {
      sb.append(ch);
    }
    return sb.toString();
  }
}
