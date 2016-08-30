package foam.lib.json;

import foam.lib.parse.*;

public class AnyParser extends ProxyParser {
  public AnyParser() {
    super(new Alt(
                  new StringParser(),
                  new IntParser(),
                  new FObjectParser()));
  }
}
