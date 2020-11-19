/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class SeqI
  implements Parser
{
  private Parser[] parsers;
  private int[] indices;

  public SeqI(int[] indexes,  Parser... args) {
    parsers = args;
    indices = indexes;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Object[] value = new Object[indices.length];

    for ( int i = 0 ; i < parsers.length ; i++ ) {
      ps = ps.apply(parsers[i], x);
      if ( ps == null ) return null;
      for ( int j = 0; j < indices.length; j++ ) {
        if ( i == indices[j] ) value[j] = ps.value();
      }
    }

    return ps.setValue(value);
  }
}
