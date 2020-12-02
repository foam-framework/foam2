/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.core.PropertyInfo;
import foam.lib.json.Whitespace;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.PStream;
import foam.lib.parse.Seq1;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class PropertyExpressionParser
  extends ProxyParser
{
  PropertyInfo prop_;
  private final static Map map__ = new ConcurrentHashMap();

  /**
   * Implement the multiton pattern so we don't create the same
   * parser more than once.
   **/
  public static Parser create(PropertyInfo p) {
    Parser prs = (Parser) map__.get(p.toString());

    if ( prs == null ) {
      prs = new PropertyExpressionParser(p);
      map__.put(p.toString(), prs);
    }

    return prs;
  }

  private PropertyExpressionParser(PropertyInfo prop) {
    prop_ = prop;

    setDelegate(new Seq1(2,
      Whitespace.instance(),
      createPropertyNameParser(),
      // TODO: There should probably be a better way to detect Date
      // properties, but this works for now.
      prop.getValueClass().equals(Date.class) ?
        new Alt(
          new EqualsParser(DuringExpressionParser.instance()),
          new BeforeLteParser(new LiteralDateParser()),
          new BeforeLtParser(new LiteralDateParser()),
          new AfterGteParser(new LiteralDateParser()),
          new AfterGtParser(new LiteralDateParser())) :
        new Alt(
          new EqualsParser(prop.queryParser()),
          new ContainParser(prop.queryParser()),
          new BeforeLteParser(prop.queryParser()),
          new BeforeLtParser(prop.queryParser()),
          new AfterGteParser(prop.queryParser()),
          new AfterGtParser(prop.queryParser()))));
  }

  public Parser createPropertyNameParser() {
    List<String> names = new ArrayList<String>();

    names.add(prop_.getName());

    if ( prop_.getShortName() != null ) names.add(prop_.getShortName());

    for ( String a : prop_.getAliases() ) {
      names.add(a);
    }

    Collections.sort(names, new Comparator<String>() {
      public int compare(String s1, String s2) {
        int l1 = s1.length(), l2 = s2.length();
        return l1 == l2 ? s1.compareTo(s2) : l2-l1;
      }
    });

    Parser[] parsers = new Parser[names.size()];
    for ( int i = 0 ; i < names.size() ; i++ ) {
      parsers[i] = Literal.create(names.get(i));
    }

    return names.size() == 1 ? parsers[0] : new Alt(parsers);
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("arg1", prop_);

    return super.parse(ps, x);
  }
}
