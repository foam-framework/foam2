/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Alt;

public class StringParser
  implements Parser 
{
  MultiLineStringParser mp = new MultiLineStringParser();
  SingleLineStringParser sp = new SingleLineStringParser();
  Alt altp = new Alt(new MultiLineStringParser(), new SingleLineStringParser());

  public StringParser() {
  }

  public PStream parse(PStream ps, ParserContext x) {
    return altp.parse(ps, x);
  }
}
