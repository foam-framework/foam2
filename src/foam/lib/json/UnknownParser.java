/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownParser
  extends ProxyParser
{
  public UnknownParser() {
    super(new Parser() {

      private Parser delegate = new Alt(
        new NullParser(),
        new BooleanParser(),
        //double parser should be before LongParser()
        new DoubleParser(),
        new LongParser(),
        new StringParser(),
        new UnknownReferenceParser());
      
      public PStream parse(PStream ps, ParserContext x) {
        PStream ps1 = ps.apply(delegate, x);

        if ( ps1 == null ) {
          return null;
        }

        Object o = ps1.value();
        Object value = null;
        if ( o == null ) {
          value = "null";
        } else if ( o instanceof Boolean ) {
          value = ((Boolean) o).toString();
        } else if ( o instanceof Long ) {
          value = ((Long) o).toString();
        } else if ( o instanceof Double ) {
          value = ((Double) o).toString();
        } else if ( o instanceof String ) {
          value = "\"" + (String) o + "\"";
        } else {
          value = o;
        }
        return ps1.setValue(value);
      }
    });
  }
}