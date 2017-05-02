package foam.lib.json;

import foam.lib.parse.*;

public class AnyParser extends ProxyParser {
  public AnyParser() {
    super(new Alt(
                  new NullParser(),
                  new StringParser(),
                  new ByteParser(),
                  new ShortParser(),
                  new LongParser(),
                  new IntParser(),
                  new FloatParser(),
                  new BooleanParser(),
                  new FObjectParser()));
  }
}
