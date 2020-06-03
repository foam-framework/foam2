/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.dao.DAO;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.util.SafetyUtil;

public class DigRemoveOperation extends DigOperation
{
  public DigRemoveOperation(X x) {
    super(x);
  }

  public void execute(X x) {
    HttpParameters p = x.get(HttpParameters.class);
    Format format = (Format) p.get(Format.class);
    String id = p.getParameter("id");
    
    DAO dao = getDAO(x);
    if ( dao == null )
      return;
    
    if ( SafetyUtil.isEmpty(id) ) {
      DigUtil.outputException(x, new UnknownIdException.Builder(x).build(), format);
      return;
    }

    ClassInfo cInfo = dao.getOf();
    PropertyInfo idProp = (PropertyInfo) cInfo.getAxiomByName("id");
    Object idObj = idProp.fromString(id);
    FObject targetFobj = dao.find(idObj);

    if ( targetFobj == null ) {
      DigUtil.outputException(x, new UnknownIdException.Builder(x).build(), format);
      return;
    } 

    dao.remove(targetFobj);
    DigUtil.outputException(x, 
      new DigSuccessMessage.Builder(x)
        .setMessage("Success").build(), 
      format);

    logger_.debug(this.getClass().getSimpleName(), "success");
  }
}
