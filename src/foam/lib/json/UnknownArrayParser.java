/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownArrayParser
  extends ProxyParser
{
  public UnknownArrayParser() {
    super(new Parser() {
      Parser delegate = new Seq1(3,
      new Whitespace(),
      new Literal("["),
      new Whitespace(),
      new Repeat(
        new UnknownParser(),
        new Seq0(new Whitespace(), new Literal(","), new Whitespace())),
      new Whitespace(),
      new Literal("]"));

      public PStream parse(PStream ps, ParserContext x) {
        ps = ps.apply(delegate, x);
        
        if ( ps == null ) {
          return null;
        }

        Object[] objs = (Object[]) ps.value();
        String res = "[";

        for ( int i = 0 ; i < objs.length ; i++ ) {
          res = res + objs[i].toString();
          if ( i < objs.length - 1 ) {
            res = res + ",";
          }
        }
        res = res + "]";
        return ps.setValue(res);
      }
    });
  }
}