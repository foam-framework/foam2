/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
        new UnknownStringParser(),
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
        } else {
          value = o.toString();
        }
        return ps1.setValue(value);
      }
    });
  }
}