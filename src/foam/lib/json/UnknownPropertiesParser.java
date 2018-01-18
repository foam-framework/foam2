/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownPropertiesParser
  extends ProxyParser
{
  public UnknownPropertiesParser() {
    super(new Parser() {
      Parser delegate = new Repeat(new Seq1(1, new Whitespace(), new UnknownKeyValueParser0()),
      new Literal(","));
      public PStream parse(PStream ps, ParserContext x) {
        ps = ps.apply(delegate, x);
        if ( ps == null ) {
          return null;
        }
        Object[] objs = (Object[]) ps.value();
        String res = "";
        for ( int i = 0 ; i < objs.length ; i++ ) {
          res = res + objs[i].toString();
          if ( i < objs.length - 1) {
            res = res + ",";
          }
        }
        return ps.setValue(res);
      }
    });
  }
}