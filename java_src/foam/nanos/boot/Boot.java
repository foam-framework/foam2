package foam.nanos.boot;

import foam.core.*;
import foam.dao.*;
import foam.nanos.*;

public class Boot {

  protected DAO serviceDAO_;
  protected X   root_ = new ProxyX();

  public Boot() {
    serviceDAO_ = new MapDAO();
    loadTestData();
    ((MapDAO)serviceDAO_).setOf(NSpec.getOwnClassInfo());

    ((AbstractDAO)serviceDAO_).select(new AbstractSink() {
      public void put(Detachable sub, FObject obj) {
        NSpec sp = (NSpec) obj;
        System.out.println("NSpec: " + sp.getName());

        NanoService ns = sp.createService();
        ns.setX(root_);
        ns.start();
        root_.put(sp.getName(), ns);
      }
    });
  }

  protected void loadTestData() {
    NSpec s = new NSpec();
    s.setName("http");
    s.setServiceClass("foam.nano.http.HttpServer");
    serviceDAO_.put(s);
  }

  public void main (String[] args) throws Exception {
    new Boot();

    Thread.currentThread().setDaemon(true);
  }

}