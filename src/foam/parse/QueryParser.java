package foam.parse;

import java.util.ArrayList;
import java.util.List;

import foam.lib.parse.Alt;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.query.AndParser;
import foam.lib.query.HasParser;
import foam.lib.query.IsParser;
import foam.lib.query.MeParser;
import foam.lib.query.NegateParser;
import foam.lib.query.OrParser;
import foam.lib.query.ParenParser;
import foam.lib.query.PropertyExpressionParser;

public class QueryParser extends foam.lib.parse.ProxyParser {
  private foam.core.ClassInfo info_;

  public QueryParser( foam.core.ClassInfo classInfo ) {
    info_ = classInfo;

    java.util.List properties = classInfo.getAxiomsByClass(foam.core.PropertyInfo.class);

    List<Parser> expressions = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      foam.core.PropertyInfo info = (foam.core.PropertyInfo) prop;

      expressions.add(new PropertyExpressionParser(info));
      expressions.add(new NegateParser(new PropertyExpressionParser(info)));
      expressions.add(new HasParser(info));
      expressions.add(new ParenParser(new PropertyExpressionParser(info)));

      if ( info.getSQLType().equalsIgnoreCase("BOOLEAN") ) expressions.add(new IsParser(info));
    }

    expressions.add(new MeParser());

    Parser[] parsers = new Parser[expressions.size()];
    expressions.toArray(parsers);

    setDelegate(new Alt(new ParenParser (new OrParser(new AndParser(new Alt(parsers)))),
                        new ParenParser (new OrParser(new ParenParser(new AndParser(new Alt(parsers))))),
                        new OrParser(new AndParser(new Alt(parsers)))));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return super.parse(ps, x);
  }
}
