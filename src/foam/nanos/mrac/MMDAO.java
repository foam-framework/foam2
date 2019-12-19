/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.core.X;
import foam.core.ClassInfo;
import foam.core.FObject;
import foam.dao.java.JDAO;
import foam.dao.MDAO;
import foam.core.Identifiable;

public class MMDAO extends JDAO {

  String mnPort;

  public MMDAO(X x, ClassInfo classInfo, String mnPort) {
    setX(x);
    setOf(classInfo);
    setDelegate(new MDAO(classInfo));
    setJournal(MMJournal.getMMjournal(mnPort));
    this.mnPort = mnPort;
  }

  //Remove synchronized key word.
  //TODO: move lock to here
  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) throw new RuntimeException("obj is null");

    Object id = ((Identifiable) obj).getPrimaryKey();
    String className = obj.getClass().getName();
    String uniqueString = className + id.toString();
    String uniqueStringLock = String.valueOf(uniqueString).intern();

    //TODO: Change to assembly version.
    synchronized ( uniqueStringLock ) {
      getJournal().put_(x, null, obj);
      super.put_(x, obj);
    }
    return null;
  }

  //Remove synchronized key word.
  @Override
  public FObject remove_(X x, FObject obj) {
    throw new RuntimeException("Implement......");
  }
}
