/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

    //TODO: use ThreadLocal
    //TODO: fix for valid json ']'
    StringBuilder sb = new StringBuilder();
    int  count = 1;
    char head;

    sb.append(ps.head());
    ps = ps.tail();
    while( ps.valid() && count != 0 ) {
      head = ps.head();
      if ( head == '[') {
        count++;
      } else if ( head == ']') {
        count--;
      }
      sb.append(head);
      ps = ps.tail();
    }

    UnknownFObjectArray unknownFObjectArray = ((X) x.get("X")).create(UnknownFObjectArray.class);
    unknownFObjectArray.setJson(sb.toString());
    return ps.setValue(unknownFObjectArray);
  }
}