/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *   http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.box.Box;
import foam.box.Skeleton;
import foam.core.ContextAware;
import foam.dao.DAOSkeleton;
import foam.nanos.NanoService;
import foam.nanos.boot.NSpec;
import foam.nanos.box.NanoServiceRouter;
import foam.nanos.logger.Logger;

public class TcpNioRouter
	extends NanoServiceRouter
	implements NanoService, ContextAware
{
	@Override
	protected Box createServiceBox(NSpec spec, Object service) {
  Logger    logger   = (Logger)getX().get("logger");

  if ( ! spec.getServe() ) {
    logger.warning(this.getClass(), "Request attempted for disabled service", spec.getName());
    return null;
  }

  informService(service, spec);

  try {
    foam.box.Box result = null;
    Class cls = spec.getBoxClass() != null && spec.getBoxClass().length() > 0 ?
    Class.forName(spec.getBoxClass()) :
    DAOSkeleton.class ;
    Skeleton skeleton = (Skeleton)getX().create(cls);
    result = skeleton;

    informService(skeleton, spec);
    skeleton.setDelegateObject(service);

    foam.core.X x = getX().put(NSpec.class, spec);

		//Ignore session right now.
    //result = new foam.box.SessionServerBox(x, result, spec.getAuthenticate());

    return result;
  } catch (ClassNotFoundException ex) {
    logger.error(this.getClass(), "Unable to create NSpec servlet: ", spec.getName(), "error: ", ex);
  }
		return null;
	}
}
