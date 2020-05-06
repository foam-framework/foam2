/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.Alt;
import foam.lib.parse.Parser;
import foam.lib.parse.ProxyParser;

public class CSVStringParser
  extends ProxyParser
{
  private final static Parser instance__ = new CSVStringParser();

  public static Parser instance() { return instance__; }

  // TODO: make private
  public CSVStringParser() {
    super(
      new Alt(new CSVNormalStringParser(), new CSVEscapeStringParser())
    );
  }
}
