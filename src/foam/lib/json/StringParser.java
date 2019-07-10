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
import foam.lib.parse.Literal;

public class StringParser
  implements Parser
{
  protected final static char ESCAPE = '\\';
  protected final static ThreadLocal<Parser> unicodeParser = ThreadLocal.withInitial(UnicodeParser::new);
  protected final static ThreadLocal<Parser> asciiEscapeParser = ThreadLocal.withInitial(ASCIIEscapeParser::new);
  protected Parser delimiterParser = new Alt(new Literal("\"\"\""), 
    new Literal("\""),
    new Literal("'")
    );
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

  public StringParser() {
  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ! ps.valid() ) return null;

    ps = ps.apply(delimiterParser, x);
    if ( ps == null ) return null;
    Parser delimiter = new Literal((String)ps.value());
    boolean isMultiLine = (ps.value().equals("\"\"\"")) ? true : false;

    StringBuilder builder = sb.get();
    PStream result;
    char lastc = ps.head();

    while ( ps.valid() ) {
      char c = ps.head();

      result = ps.apply(delimiter, x);
      if ( result != null && lastc != ESCAPE )  break;

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
      } else if ( c != '\n' ) {
        builder.append(c);
      }

      ps = tail;
      lastc = c;
    }
    if ( isMultiLine ) ps = ps.tail().tail();

    return ps.tail().setValue(builder.toString());
  }
}
