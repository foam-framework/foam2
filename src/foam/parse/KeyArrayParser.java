/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.parse.*;

public class KeyArrayParser implements Parser {
  private Parser delegate;

  public KeyArrayParser(String[] keyArray) {
    Literal[] keys = new Literal[keyArray.length * 2];
    for (int i = 0, j = 0; i < keyArray.length; i++, j++) {
      keys[j] = new Literal("\"" + keyArray[i] + "\"");
      keys[++j] = new Literal(keyArray[i]);
      System.out.println(keyArray[i] + keys[j - 1] + keys[j]);
    }
    delegate = new Alt(keys);
  }

  public PStream parse(PStream ps, ParserContext x) {
    return ps.apply(delegate, x);
  }
}
