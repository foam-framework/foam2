/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.pm;

import foam.core.*;
import foam.dao.MDAO;

/**
 * MDAO specifically for PMInfo's which doesn't freeze() or clone() values
 * so they can be updated in-place without doing a DAO.put().
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
