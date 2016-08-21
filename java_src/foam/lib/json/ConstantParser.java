package foam.lib.json;

import foam.lib.parse.*;

public class ConstantParser extends ProxyParser {
  public ConstantParser() {
    super(new Alt(
                  new StringParser(),
                  new IntParser()));
  }
}
