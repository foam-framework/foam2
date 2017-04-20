package foam.dao;

import java.util.*;

public class ListSink extends AbstractSink implements foam.lib.json.OutputJSON {
  private ArrayList data_ = new ArrayList();

  public List getData() {
    return data_;
  }

  public void put(foam.core.Detachable sub, foam.core.FObject obj) {
    getData().add(obj);
  }

  public void outputJSON(StringBuilder out, foam.lib.json.Outputter outputter) {
    Object[] data = getData().toArray();
    out.append("{\"class\":\"foam.dao.ArraySink\",\"a\":");
    outputter.output(out, data);
    out.append("}");
  }
}
