/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import foam.lib.json.KeyParser;

public class Seq3 implements Parser {
  private Parser[] parsers;
  private int      index;
  private int      opIndex;
  private Object   operator;

  public Seq3(int i, int j, Parser... args) {
    parsers = args;
    index = i;
    opIndex = j;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Object value = null;
    for (int i = 0; i < parsers.length; i++) {
      ps = ps.apply(parsers[i], x);
      if (ps == null)
        return null;
      if (i == index) {
        value = ps.value();
      }
      if (i == opIndex) {
        value = ps.value();
        operator = value;
      }
    }
    ps.setOperator(operator);
    return ps.setValue(value);
  }
}
