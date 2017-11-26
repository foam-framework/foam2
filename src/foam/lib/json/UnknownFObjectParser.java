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

    //TODO: use ThreadLocal
    StringBuilder sb = new StringBuilder();
    int count = 1;
    char head;

    sb.append(ps.head());
    ps = ps.tail();
    while( ps.valid() && count != 0 ) {
      head = ps.head();
      if ( head == '{') {
        count++;
      } else if ( head == '}') {
        count--;
      }
      sb.append(head);
      ps = ps.tail();
    }

    UnknownFObject unknownFObject = ((X)x.get("X")).create(UnknownFObject.class);
    unknownFObject.setJson(sb.toString());
    return ps.setValue(unknownFObject);
  }
}