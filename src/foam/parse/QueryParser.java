/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.util.List;

import foam.core.ClassInfo;
import foam.core.ProxyX;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.StringPStream;
import foam.mlang.MLang;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Or;
import foam.mlang.predicate.Predicate;

/**
 * Returns a predicate based on the MQL Query Language (Generic Google-like
 * query-language). The data argument must specify the Query to parse. The
 * defaultClass argument is a specify the class/Model/element that contain the
 * meta-data.
 * <p>
 * Create a query strings to MLangs parser for a particular class.
 * 
 * @param data
 *          text to parse
 * @param defaultClass
 *          class/model
 * @return Predicate
 */

public class QueryParser extends foam.core.ContextAwareSupport {

  protected Parser        parser   = new ExprParser();
  protected StringPStream stringps = new StringPStream();
  ProxyParser             prx      = new ProxyParser();
  Class                   of;
  String                  me;                            

  public QueryParser(String string) throws ClassNotFoundException {
    prx.setDelegate(parser);
  }

  public QueryParser(String data, ClassInfo defaultClass) {
    this.parseString(data, defaultClass.getClass());
  }

  public Predicate parseString(String data) {
    return parseString(data, null);
  }

  public Predicate parseString(String data, Class defaultClass) {
    
    data = data + " *";//add EOF
    StringPStream ps = stringps;
    ps.setString(data);
    ParserContext x = new ParserContextImpl();

    x.set("X", (getX() == null) ? new ProxyX() : getX());
    x.set("defaultClass", defaultClass);

    ps = (StringPStream) ps.apply(defaultClass == null ? parser : new ExprParser(defaultClass), x);

    //this list contain alternation of predicate and operator 
    List<Predicate> ls = ((List<Predicate>) x.get("objPar"));
    Predicate res = null;
    if (!ls.isEmpty()) {
      res = ls.get(0);
      for (int i = 1; i < ls.size(); i++) {
        Predicate curr = ls.get(i);
        if (curr instanceof Or) {
          res = MLang.OR(res, ls.get(++i));
        } else if (curr instanceof And) {
          res = MLang.AND(res, ls.get(++i));
        } 
        else if (i == ls.size() - 1) {
          res = MLang.AND(res, ls.get(i));
        }
      }
    }   
    return res;

    /*
     * JSON version StringPStream ps = stringps; ps.setString(data);
     * ParserContext x = new ParserContextImpl();
     * 
     * x.set("X", (getX() == null) ? new ProxyX() : getX());
     * x.set("defaultClass", defaultClass);
     * 
     * ps = (StringPStream) ps.apply(defaultClass == null ? parser : new
     * ExprParser(defaultClass), x);
     * 
     * // TODO add AND OR to the grammar List<Predicate> predicateArray =
     * createPredicate(ps);
     * 
     * Predicate predicate = MLang.AND(predicateArray.toArray(new
     * foam.mlang.predicate.Predicate[predicateArray.size()]));
     * 
     * return predicate;
     */
  }
}
