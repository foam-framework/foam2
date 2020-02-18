/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.PropertyInfo;
import foam.lib.parse.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class PropertyParser
  extends ProxyParser
{
  protected PropertyInfo prop_;
  private final static Map map__ = new ConcurrentHashMap();
  
  /**
   * Implement the multiton pattern so we don't create the same
   * parser more than once.
   **/
  public static Parser create(PropertyInfo p) {
    Parser prs = (Parser) map__.get(p.toString());

    if ( prs == null ) {
      prs = new PropertyParser(p);
      map__.put(p.toString(), prs);
    }

    return prs;
  }

  private PropertyParser(PropertyInfo p) {
    prop_ = p;

    setDelegate(
      new Seq1(5,
        Whitespace.instance(),
        createPropertyNameParser(),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        p.jsonParser(),
        Whitespace.instance()));
  }

  public Parser createPropertyNameParser() {
    List<String> names = new ArrayList<String>();

    names.add(prop_.getName());

    if ( prop_.getShortName() != null ) names.add(prop_.getShortName());

    Collections.sort(names, new Comparator<String>() {
      public int compare(String s1, String s2) {
        int l1 = s1.length(), l2 = s2.length();
        return l1 == l2 ? s1.compareTo(s2) : l2-l1;
      }
    });

    Parser[] parsers = new Parser[names.size()];
    for ( int i = 0 ; i < names.size() ; i++ ) {
      parsers[i] = new KeyParser(names.get(i));
    }

    return names.size() == 1 ? parsers[0] : new Alt(parsers);
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return null;
    prop_.set(x.get("obj"), ps.value());
    return ps;
  }

  public String toString() {
    return "PropertyParser(" + prop_.getName() + ")";
  }
}
