package foam.lib.json;

import foam.lib.parse.*;

public class FObjectArrayParser extends ProxyParser {
  public FObjectArrayParser() {
    super(new Seq1(3,
                   new Whitespace(),
                   new Literal("["),
                   new Whitespace(),
                   new Repeat(
                              new FObjectParser(),
                              new Seq0(new Whitespace(),
                                       new Literal(","),
                                       new Whitespace())),
                   new Literal("]"),
                   new Whitespace()));
  }
}
