/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

public class JSONParser
  extends foam.core.ContextAwareSupport
{
  protected Parser   parser   = new ExprParser();
  protected StringPS stringps = new StringPS();

  public FObject parseString(String data) {
    return parseString(data, null);
  }

  public FObject parseString(String data, Class defaultClass) {
    StringPS ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", getX());
    x.set("defaultClass", defaultClass);
    ps = (StringPS) parser.parse(ps, x);

    return ps == null ? null : (FObject) ps.value();
  }
}
