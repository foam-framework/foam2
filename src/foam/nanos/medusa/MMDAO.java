/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.core.X;
import foam.core.ClassInfo;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Identifiable;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.java.JDAO;
import foam.dao.MDAO;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.Logger;
import foam.nanos.fs.ResourceStorage;
import foam.nanos.fs.Storage;

public class MMDAO extends JDAO {

  String mnPort;
  //TODO: inject NSpec to record where the entry come from.
  //nSpec.getName();
  NSpec nspec;
  String nspecKey;

  //public MMDAO(X x, ClassInfo classInfo, String mnPort) {
  //  setX(x);
  //  setOf(classInfo);

  //  nspecKey = classInfo.getId();
  //  setDelegate(new MDAO(classInfo));
  //  setJournal(MMJournal.getMMjournal(x, mnPort));
  //  this.mnPort = mnPort;
  //  //TODO: command replay for testing election.
  //  // getJournal().replay(x, getDelegate());
  //}

  public MMDAO(X x, String nspecKey, DAO dao, String journalKey, String fileName) {
    setX(x);
    setOf(dao.getOf());

    // Load journal from resource.journals first.
    X resourceStorageX = x;
    if ( System.getProperty("resource.journals.dir") != null ) {
      resourceStorageX = x.put(Storage.class,
          new ResourceStorage(System.getProperty("resource.journals.dir")));
    }
    new foam.dao.FileJournal.Builder(resourceStorageX)
      .setFilename(fileName+".0").build().replay(x, dao);

    this.nspecKey = nspecKey;
    setDelegate(dao);
    this.mnPort = journalKey;
    setJournal(MMJournal.getMMjournal(x, journalKey));
    ((MMJournal) getJournal()).replay(x, nspecKey, getDelegate());
  }
  //Remove synchronized key word.
  //TODO: move lock to here
  @Override
  public synchronized FObject put_(X x, FObject obj) {
    if ( obj == null ) throw new RuntimeException("obj is null");

    Object id = ((Identifiable) obj).getPrimaryKey();
    String className = obj.getClass().getName();
    String uniqueString = className + id.toString();
    String uniqueStringLock = String.valueOf(uniqueString).intern();

    FObject result = null;
    //TODO: Change to assembly version.
    synchronized ( uniqueStringLock ) {
      ((Logger)x.get("logger")).debug("MMDAO", this.nspecKey, "journal.put", obj);
      result = getJournal().put(x, nspecKey, getDelegate(), obj);
      //      ((Logger)x.get("logger")).debug("MMDAO", this.nspecKey, "delegate mdao.put", result);
      //      result = getDelegate().put_(x, result);
    }
    return result;
  }

  //Remove synchronized key word.
  @Override
  public synchronized FObject remove_(X x, FObject obj) {
    if ( obj == null ) throw new RuntimeException("obj is null");

    Object id = ((Identifiable) obj).getPrimaryKey();
    String className = obj.getClass().getName();
    String uniqueString = className + id.toString();
    String uniqueStringLock = String.valueOf(uniqueString).intern();

    FObject result = null;
    synchronized ( uniqueStringLock ) {
      result = getDelegate().find_(x, obj.getProperty("id"));
      if ( result == null ) throw new RuntimeException("Record do not find. Id: " + obj.getProperty("id"));
      getJournal().remove(x, nspecKey, getDelegate(), obj);
      result = getDelegate().remove_(x, obj);
    }
    return result;
  }

}
