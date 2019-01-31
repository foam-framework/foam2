/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

// Note: JSONParser.java has a limitation - the class has to be 
// the first key, to avoid having to build an intermediate object 
// to hold all the args while we parse

public class JSONParser
  extends foam.core.ContextAwareSupport
{
  protected Parser        parser   = new ExprParser();
  protected StringPStream stringps = new StringPStream();

  public FObject parseString(String data) {
    return parseString(data, null);
  }

  public FObject parseString(String data, Class defaultClass) {
    StringPStream ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", getX());
    ps = (StringPStream) ps.apply(defaultClass == null ? parser : new ExprParser(defaultClass), x);

    return ps == null ? null : (FObject) ps.value();
  }

  public Object[] parseStringForArray(String data, Class defaultClass) {
    StringPStream ps = stringps;
    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", getX());

    ps = (StringPStream) ps.apply(new FObjectArrayParser(defaultClass), x);
    return ps == null ? null : (Object[]) ps.value();
  }

}
