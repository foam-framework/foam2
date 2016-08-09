package foam.lib.parse;

import java.util.HashMap;

public class ParserContextImpl implements ParserContext {
  private HashMap<String, Object> map_ = new HashMap<String, Object>();

  public Object get(String key) {
    return map_.get(key);
  }

  public void set(String key, Object value)  {
    map_.put(key, value);
  }
}
