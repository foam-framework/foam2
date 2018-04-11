/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;

public class LiteralIC implements Parser {
  private String string;
  private Object value;

  public LiteralIC(String s) {
    this(s, s);
  }

  public LiteralIC(String s, Object v) {
    string = s.toUpperCase();
    value = v;
  }

  public PStream parse(PStream ps, ParserContext x) {
    for ( int i = 0 ; i < string.length() ; i++ ) {
      if ( ! ps.valid() ||
          Character.toUpperCase(ps.head()) != string.charAt(i) ) {
        return null;
      }

      ps = ps.tail();
    }

    return ps.setValue(value);
  }
}
