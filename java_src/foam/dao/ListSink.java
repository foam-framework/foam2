package foam.dao;

import java.util.*;

public class ListSink
  extends    AbstractSink
  implements foam.lib.json.OutputJSON
{
  protected ArrayList data_ = new ArrayList();

  public List getData() {
    return data_;
  }

  public void put(foam.core.FObject obj, foam.core.Detachable sub) {
    getData().add(obj);
  }

  public void outputJSON(StringBuilder out, foam.lib.json.Outputter outputter) {
    Object[] data = getData().toArray();
    out.append("{\"class\":\"foam.dao.ArraySink\",\"array\":");
    outputter.output(out, data);
    out.append("}");
  }
}
