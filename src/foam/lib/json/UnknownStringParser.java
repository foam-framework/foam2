/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownStringParser
  extends ProxyParser
{
  public UnknownStringParser() {
    super(new Parser() {

      private Parser delegate = new StringParser();
      
      public PStream parse(PStream ps, ParserContext x) {
        PStream ps1 = ps.apply(delegate, x);

        if ( ps1 == null ) {
          return null;
        }

        Object o = ps1.value();
        return ps1.setValue("\"" + ps1.value().toString() + "\"");
      }
    });
  }
}