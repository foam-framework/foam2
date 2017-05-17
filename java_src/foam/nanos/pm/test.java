package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.dao.ListSink;
import foam.dao.MapDAO;
import foam.nanos.NanoService;
import foam.nanos.boot.Boot;

import java.util.Random;

/**
 * Created by nick on 17/05/17.
 */
public class test extends ContextAwareSupport implements NanoService{

  void testloop(String name) {
    DAOPMLogger d = (DAOPMLogger) getX().get("dpl");
    for(int i = 0; i < 10; i++) {
      PM pm = new PM(test.class, name);
      try {
        Thread.sleep(new Random().nextInt(20) + 50);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      pm.end(d);
    }
  }

  void test() {
    testloop("test1");
    testloop("asdf");
    /*testloop("aasdf");
    testloop("zxcxvzx");
    testloop("hhdf");
    testloop("kfkdo");
    testloop("poasd");
    testloop(",,b.j");
    testloop("i123");
    testloop("vvjzk");
    testloop("12l3kj4");*/


    ListSink ls = new ListSink();
    MapDAO md = (MapDAO) getX().get("pminfodao");
    md.select(ls);
    for(Object o : ls.getData()) {
      PMInfo p = (PMInfo)o;
      System.out.println(p.getClsname() + " : " + p.getPmname());
      System.out.println(p.getTotaltime() + " : " + p.getNumoccurrences());
      System.out.println(p.getMintime() + " : " + p.getMaxtime());
    }
  }

  @Override
  public void start() {
    System.out.println("Starting test");
    test();
  }
}
