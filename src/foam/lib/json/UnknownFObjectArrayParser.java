/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.lib.json;

import foam.lib.parse.*;
import foam.core.X;

// TODO: Fix, doesn't parse {key:"}"}, use proper JSON parser
public class UnknownFObjectArrayParser
  implements Parser
{

  public PStream parse(PStream ps, ParserContext x) {
    ps = ps.apply(new Whitespace(), x);
    if ( ps == null ) return null;

    ps = ps.apply(new UnknownArrayParser(), x);
    if ( ps == null ) {
      return null;
    }
    UnknownFObjectArray unknownFObjectArray = ((X) x.get("X")).create(UnknownFObjectArray.class);
    unknownFObjectArray.setJson(ps.value().toString());
    return ps.setValue(unknownFObjectArray);
  }
}