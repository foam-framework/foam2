/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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

  @Override
  public void put(Object obj, foam.core.Detachable sub) {
    getData().add(obj);
  }

  public void outputJSON(foam.lib.json.Outputter outputter) {
    outputter.outputMap("class", "foam.dao.ArraySink", "array", getData());
  }
}
