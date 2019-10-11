/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.FObject;
import foam.dao.MDAO;

/**
 * MDAO for storing PMInfo's which which disables cloneing and freezing
 * so PMInfo's can be updated more quickly.
 **/
public class PMInfoMDAO
  extends MDAO
{

  public PMInfoMDAO() {
    super(PMInfo.getOwnClassInfo());
  }

  public FObject objIn(FObject obj) {
    return obj;
  }

  public FObject objOut(FObject obj) {
    return obj;
  }

}
