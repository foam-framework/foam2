/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.dao.DAO;
import foam.dao.Sink;
import java.io.IOException;

// TODO(drish): use Index interface.
// TODO: move to some other package
public interface Journal
  extends Sink
{
    public void replay(DAO dao) throws IOException;
}
