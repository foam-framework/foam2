/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.export;

public class ExportService
  extends    ProxyDAO
  implements NanoService
{

  public void start() {
    DAO dao = new JournaledDAO(new MapDAO(), "driverRegistry.txt");
    dao.setOf(DriverRegistry.class);
    setDelegate(dao);
  }
}
