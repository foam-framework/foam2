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
    // TODO switch to journaled DAO
    DAO dao = new MapDAO();
    dao.setOf(DriverRegistry.class);
    setDelegate(dao);

    DriverRegistry r;
    r = new DriverRegistry();
    r.setId("JSON");
    r.setDriverName("foam.nanos.export.JSONDriver");
    dao.put(r);

    r = new DriverRegistry();
    r.setId("XML");
    r.setDriverName("foam.nanos.export.XMLDriver");
    dao.put(r);

    r = new DriverRegistry();
    r.setId("CSV");
    r.setDriverName("foam.nanos.export.CSVDriver");
    dao.put(r);
  }
}
