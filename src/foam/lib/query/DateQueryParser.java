/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;

//YYYY
//YYYY-MM               YYYY/MM
//YYYY-MM-DD            YYYY/MM/DD
//YYYY-MM-DDTHH         YYYY/MM/DDTHH
//YYYY-MM-DDTHH:MM      YYYY/MM/DDTHH:MM
//YYYY-MM-DD..YYYY-MM-DDYYYY-MM-DD..YYYY-MM-DD
//today
//today-7
public class DateQueryParser
  extends ProxyParser
{
  public DateQueryParser() {
    super(
        new Alt(
            //YYYY-MM-DD..YYYY-MM-DD
            new YYYYMMDDRangeDateParser(),

            //YYYY-MM-DDTHH:MM
            //YYYY-MM-DDTHH
            //YYYY-MM-DD
            //YYYY-MM
            //YYYY
            new YYYYMMDDLiteralDateParser(),

            //TODO new LongParser(),

            //today-7
            //today
            new RelativeDateParser()));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps == null || ps.value() == null ) return null;
    if ( ps.value() instanceof java.lang.Long ) { return ps.setValue(new java.util.Date((java.lang.Long) ps.value())); }
    Object[] result;
    result = (Object[]) ps.value();
    if ( ps.value() instanceof Object[] ) {
      result = (Object[]) ps.value();
      return ps.setValue(result);
    } else {
      return null;
    }
  }
}
