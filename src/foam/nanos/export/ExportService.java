/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.export;

import foam.dao.DAO;
import foam.dao.JournaledDAO;
import foam.dao.MapDAO;
import foam.dao.ProxyDAO;
import foam.nanos.NanoService;

public class ExportService
  extends    ProxyDAO
  implements NanoService
{

  public void start() {
    try {
      DAO dao = new JournaledDAO(new MapDAO(), "ExportDriverRegistry.txt");
      ((JournaledDAO) dao).setOf(ExportDriverRegistry.getOwnClassInfo());
      setDelegate(dao);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
