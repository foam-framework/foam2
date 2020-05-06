/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class KeyParser
  implements Parser
{
  protected Parser delegate;

  public KeyParser(String key) {
    delegate = new Alt(
      Literal.create("\"" + key + "\""),
      Literal.create(key));
  }

  public PStream parse(PStream ps, ParserContext x) {
    return ps.apply(delegate, x);
  }
}
