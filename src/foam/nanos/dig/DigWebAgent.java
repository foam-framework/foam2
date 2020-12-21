/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.nanos.dig.drivers.*;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.pm.PM;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletResponse;

public class DigWebAgent
  implements WebAgent
{
  public DigWebAgent() {}

  public void execute(X x) {
    HttpServletResponse resp    = x.get(HttpServletResponse.class);
    HttpParameters      p       = x.get(HttpParameters.class);
    Command             command = (Command) p.get(Command.class);
    Format              format  = (Format) p.get(Format.class);
    Logger              logger  = (Logger) x.get("logger");
    PM                  pm      = new PM(getClass(), command.getName() + '/' + format.getName());

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);

    try {
      // Find the operation
      DigFormatDriver driver = DigFormatDriverFactory.create(x, format);

      if ( driver == null ) {
        DigUtil.outputException(x, new ParsingErrorException.Builder(x)
          .setMessage("Unsupported format.")
          .build(), format);
        return;
      }

      // Execute the command
      switch ( command ) {
        case PUT:
          driver.put(x);
          break;
        case SELECT:
          driver.select(x);
          break;
        case REMOVE:
          driver.remove(x);
          break;
      }
    } catch (FOAMException fe) {
      DigUtil.outputFOAMException(x, fe, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, format);
    } catch (Throwable t) {
      DigUtil.outputException(x, 
          new GeneralException.Builder(x)
            .setStatus(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR))
            .setMessage(t.getMessage())
            .setMoreInfo(t.getClass().getName())
            .build(), 
          format);
    } finally {
      pm.log(x);
    }
  }
}
