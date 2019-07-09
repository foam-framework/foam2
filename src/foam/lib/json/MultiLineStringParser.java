/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;

public class MultiLineStringParser
  implements Parser
{
  protected final static char ESCAPE = '\\';
  protected final static ThreadLocal<Parser> unicodeParser = ThreadLocal.withInitial(UnicodeParser::new);
  protected final static ThreadLocal<Parser> asciiEscapeParser = ThreadLocal.withInitial(ASCIIEscapeParser::new);
  protected final static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {

    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public MultiLineStringParser() {
  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ! ps.valid() ) return null;
    char delim = ps.head();
    char lastc = delim;

    for( int i = 0; i < 3; i++ ) {
      if ( delim != '"' ) return null;
      ps = ps.tail();
      delim = ps.head();
    }

    delim = lastc;

    StringBuilder builder = sb.get();

    while ( ps.valid() ) {
      char c = ps.head();

      if ( c == delim && lastc != ESCAPE && ps.tail().head() == delim && ps.tail().tail().head() == delim ) break;

      PStream tail = ps.tail();

      if ( c == ESCAPE ) {
        char   nextChar        = ps.tail().head();
        Parser escapeSeqParser = nextChar == 'u' ?
          unicodeParser.get() : asciiEscapeParser.get();
        PStream escapePS = ps.apply(escapeSeqParser, x);
        if ( escapePS != null ) {
          builder.append(escapePS.value());
          tail = escapePS;

          c = (Character) escapePS.value();
        }
      } else {
        builder.append(c);
      }

      ps = tail;
      lastc = c;
    }
    ps = ps.tail().tail();
    return ps.tail().setValue(builder.toString());
  }
}