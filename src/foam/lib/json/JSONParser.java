/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;
import java.io.StringReader;

public class JSONParser
  extends foam.core.ContextAwareSupport
{
  protected Parser        parser   = new ExprParser();
  protected StringPStream stringps = new StringPStream();

  public FObject parseString(String data) {
    return parseString(data, null);
  }

  public FObject parseReader(StringReader data, Class defaultClass) {
    ReaderPStream ps = new ReaderPStream();

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", getX());
    x.set("defaultClass", defaultClass);
    ps = (ReaderPStream) ps.apply(parser, x);

    return ps == null ? null : (FObject) ps.value();
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
