package foam.nanos.boot;

import foam.core.*;

public class Boot {

  protected DAO serviceDAO_;
  protected X   root_ = new ProxyX();

  public Boot() {
    serviceDAO_ = new ArrayDAO();
    loadTestData();
    serviceDAO_.setOf(foam.nanos.boot.NSpec);

    serviceDAO.select(new AbstractSink() {
      public void put(Detachable sub, FObject obj) {
        NSpec sp = (FObject) obj;
        System.out.println("NSpec: " + sp.name);

        NanoService ns = sp.createService();
        ns.setContext(root_);
        ns.start();
        root_.put(sp.name, ns);
      }
    });
  }

  protected void loadTestData() {
    NSpec s = new NSpec();
    s.setName('http');
    s.setServiceClass("foam.nano.http.HttpServer");
    serviceDAO_.put(s);
  }

  public void main (String[] args) throws Exception {
    new Boot();

    Thread.currentThread.setDaemon(true);
  }

}