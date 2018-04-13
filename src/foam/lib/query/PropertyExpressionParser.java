package foam.lib.query;

import java.util.ArrayList;
import java.util.List;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq1;

public class PropertyExpressionParser
  extends foam.lib.parse.ProxyParser {

  foam.core.PropertyInfo info_;

  public PropertyExpressionParser(foam.core.PropertyInfo prop) {
    info_ = prop;

    List<Parser> parsers = new ArrayList<Parser>();
    for ( String aliase : prop.getAliases() ) {
      parsers.add( new Literal( aliase ) );
    }
    if ( prop.getShortName() != null ) parsers.add(new Literal(prop.getShortName()));

    parsers.add( new Literal(prop.getName()) );

    Alt names = new Alt( parsers.toArray(new Parser[parsers.size()]) );

    setDelegate(new Seq1(2,
                         new foam.lib.json.Whitespace(),
                         new Alt(names),
                         // TODO: There should probably be a better way to detect Date
                         // properties, but this works for now.
                         prop.getValueClass().equals(java.util.Date.class) ?
                         new Alt(new EqualsParser(new DuringExpressionParser()),
                                 new BeforeLteParser(new LiteralDateParser()),
                                 new BeforeLtParser(new LiteralDateParser()),
                                 new AfterGteParser(new LiteralDateParser()),
                                 new AfterGtParser(new LiteralDateParser())) :
                         new Alt(new EqualsParser(prop.queryParser()),
                                 new ContainParser(prop.queryParser()),
                                 new BeforeLteParser(prop.queryParser()),
                                 new BeforeLtParser(prop.queryParser()),
                                 new AfterGteParser(prop.queryParser()),
                                 new AfterGtParser(prop.queryParser()))));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("arg1", info_);

    return super.parse(ps, x);
  }
}
