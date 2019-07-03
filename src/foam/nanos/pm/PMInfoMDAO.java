/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.pm;

import foam.core.*;
import foam.dao.MutableMDAO;

/**
 * MDAO specifically for PMInfo's which doesn't freeze() or clone() values
 * so they can be updated in-place without doing a DAO.put().
 **/
public class PMInfoMDAO
  extends MutableMDAO
{
  public PMInfoMDAO() {
    super(PMInfo.getOwnClassInfo());
  }
}
