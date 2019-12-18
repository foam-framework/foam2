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

public class MMDAO extends JDAO {

  String mnPort;

  public MMDAO(X x, ClassInfo classInfo, String mnPort) {
    setX(x);
    setOf(classInfo);
    setDelegate(new MDAO(classInfo));
    this.mnPort = mnPort;
  }

  //Remove synchronized key word.
  @Override
  public FObject put_(X x, FObject obj) {
    return null;
  }

  //Remove synchronized key word.
  @Override
  public FObject remove_(X x, FObject obj) {
    throw new RuntimeException("Implement......");
  }
}
