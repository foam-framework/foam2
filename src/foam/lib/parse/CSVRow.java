/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class CSVRow extends foam.lib.parse.ProxyParser {
  public CSVRow() {
    foam.lib.parse.Parser escapedQuote = new Literal("\"\"");
    foam.lib.parse.Parser quotedText = new Seq1(1,
      new Literal("\""),
      new Repeat(
        new Alt(
          escapedQuote,
          new Not(
            new Seq(
              new Literal("\""),
              new AnyChar()
            )
          )
        )
      ),
      new Literal("\"")
    );
    foam.lib.parse.Parser escape = new Alt(
      new Literal(","),
      new Literal("\n"),
      new Literal("\r")
    );
    foam.lib.parse.Parser unquotedText = new Repeat(
      new Not(escape)
    );
  setDelegate(unquotedText);
  //  foam.lib.parse.Parser field = new Alt(
  //    quotedText,
  //    unquotedText
  //  );
  //  setDelegate(new Seq1(0, new Repeat(field, ",")));
  }
}
