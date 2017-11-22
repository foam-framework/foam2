/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.lib.json;

import foam.lib.parse.*;
import foam.core.X;

public class UnknownFObjectParser implements Parser {

  public PStream parse(PStream ps, ParserContext x) {
    ps = ps.apply(new Whitespace(), x);
    if ( ps == null ) return null;

    StringBuilder sb = new StringBuilder();

    while( ps.valid() ) {
      sb.append(ps.head());
      ps = ps.tail();
    }

    UnknownFObject unknownFObject = ((X)x.get("x")).create(UnknownFObject.class);
    unknownFObject.setJson(sb.toString());

    return ps.setValue(unknownFObject);
  }
}