/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.java.JDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.logger.ProxyLogger;
import foam.nanos.logger.StdoutLogger;
import foam.nanos.pm.NullPM;
import foam.nanos.pm.PM;
import foam.nanos.script.Script;
import foam.nanos.session.Session;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

import static foam.mlang.MLang.EQ;

public class Boot {
  // Context key used to store the top-level root context in the context.
  public final static String ROOT = "_ROOT_";
  public static PM nullPM_ = new NullPM();

  protected DAO serviceDAO_;
  protected X   root_ = new ProxyX();
  protected Map<String, NSpecFactory> factories_ = new HashMap<>();

  public Boot() {
    this("");
  }

  public Boot(String datadir) {
    Logger logger = new ProxyLogger(new StdoutLogger());
    root_.put("logger", logger);

    if ( datadir == null || datadir == "" ) {
      datadir = System.getProperty("JOURNAL_HOME");
    }

    root_.put(foam.nanos.fs.Storage.class,
        new foam.nanos.fs.FileSystemStorage(datadir));

    // Used for all the services that will be required when Booting
    serviceDAO_ = new JDAO(((foam.core.ProxyX) root_).getX(), NSpec.getOwnClassInfo(), "services");

    installSystemUser();

    // Just adding services in order will create an un-ordered tree,
    // so add so that we get a balanced Context tree.
    ArraySink arr = (ArraySink) serviceDAO_.select(new ArraySink());
    List      l   = perfectList(arr.getArray());

    for ( int i = 0 ; i < l.size() ; i++ ) {
      NSpec sp = (NSpec) l.get(i);
      NSpecFactory factory = new NSpecFactory((ProxyX) root_, sp);
      factories_.put(sp.getName(), factory);
      logger.info("Registering:", sp.getName());
      root_.putFactory(sp.getName(), factory);
    }

    serviceDAO_.listen(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        NSpec sp = (NSpec) obj;

        logger.info("Reload service:", sp.getName());
        factories_.get(sp.getName()).invalidate(sp);
      }
    }, null);

    // PM factory
    root_ = root_.putFactory("PM", new XFactory() {
      public Object create(X x) {
        int rand = ThreadLocalRandom.current().nextInt(0, 100);
        if ( rand == 0 ) {
          return new PM();
        } else {
          return nullPM_;
        }
      }
    });

    // Use an XFactory so that the root context can contain itself.
    root_ = root_.putFactory(ROOT, new XFactory() {
      public Object create(X x) {
        return Boot.this.getX();
      }
    });

    // Revert root_ to non ProxyX to avoid letting children add new bindings.
    root_ = ((ProxyX) root_).getX();

    // Export the ServiceDAO
    ((ProxyDAO) root_.get("nSpecDAO")).setDelegate(
        new foam.nanos.auth.AuthorizationDAO(getX(), serviceDAO_, new foam.nanos.auth.GlobalReadAuthorizer("service")));
    // 'read' authenticated version - for dig and docs
    ((ProxyDAO) root_.get("AuthenticatedNSpecDAO")).setDelegate(
        new foam.dao.PMDAO(root_, new foam.nanos.auth.AuthorizationDAO(getX(), (DAO) root_.get("nSpecDAO"), new foam.nanos.auth.StandardAuthorizer("service"))));

    serviceDAO_.where(EQ(NSpec.LAZY, false)).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        NSpec sp = (NSpec) obj;

        logger.info("Starting:", sp.getName());
        root_.get(sp.getName());
      }
    });

    String startScript = System.getProperty("foam.main", "main");
    if ( startScript != null ) {
      DAO    scriptDAO = (DAO) root_.get("scriptDAO");
      Script script    = (Script) scriptDAO.find(startScript);
      if ( script != null ) {
        script.runScript(root_);
      }
    }
  }

  protected List perfectList(List src) {
    List dst = new ArrayList(src.size());
    perfectList(src, dst, 0, src.size()-1);
    return dst;
  }

  protected void perfectList(List src, List dst, int start, int end) {
    if ( start == end ) {
      dst.add(src.get(start));
    } else if ( end > start ) {
      int pivot = ( start + end ) / 2;
      perfectList(src, dst, pivot, pivot);
      perfectList(src, dst, start, pivot-1);
      perfectList(src, dst, pivot+1, end);
    }
  }

  protected void installSystemUser() {
    User user = new User();
    user.setId(User.SYSTEM_USER_ID);
    user.setFirstName("system");
    user.setGroup("system");
    user.setLoginEnabled(false);

    Session session = new Session();
    session.setUserId(user.getId());
    session.setContext(root_);

    root_.put("user", user);
    root_.put(Session.class, session);

    Group group = new Group();
    group.setId("system");
    root_.put("group", group);
  }

  public X getX() { return root_; }

  public static void main (String[] args)
    throws java.lang.Exception
  {
    System.out.println("Starting Nanos Server");

    boolean datadirFlag = false;

    String datadir = "";
    for ( int i = 0 ; i < args.length ; i++ ) {
      String arg = args[i];

      if ( datadirFlag ) {
        datadir = arg;
        datadirFlag = false;
      } else if ( arg.equals("--datadir") ) {
        datadirFlag = true;
      } else {
        System.err.println("Unknown argument " + arg);
        System.exit(1);
      }
    }

    System.out.println("Datadir is " + datadir);

    new Boot(datadir);
  }
}
