/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.Alt;
import foam.lib.parse.ProxyParser;

public class CSVStringParser
  extends ProxyParser
{
  public CSVStringParser() {
    super(
      new Alt(new CSVNormalStringParser(),
              new CSVEscapeStringParser()
      )
    );
  }
}
