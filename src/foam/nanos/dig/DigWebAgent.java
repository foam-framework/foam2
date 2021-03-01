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
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DigWebAgent extends ContextAwareSupport
  implements WebAgent, SendErrorHandler
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
      DigFormatDriver driver = DigFormatDriverFactory.create(getX(), format);

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
    } catch (DigErrorMessage dem) {
      logger.error(dem);
      DigUtil.outputException(x, dem, format);
      pm.error(x, dem.getMessage());
    } catch (FOAMException fe) {
      logger.error(fe);
      DigUtil.outputFOAMException(x, fe, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, format);
      pm.error(x, fe.getMessage());
    } catch (Throwable t) {
      logger.error(t);
      DigUtil.outputException(x,
          new GeneralException.Builder(x)
            .setStatus(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR))
            .setMessage(t.getMessage())
            .setMoreInfo(t.getClass().getName())
            .build(),
          format);
      pm.error(x, t.getMessage());
    } finally {
      pm.log(x);
    }
  }

  public void sendError(X x, int status, String message) {
    DigUtil.outputException(x,
      new GeneralException.Builder(x)
        .setStatus(String.valueOf(status))
        .setMessage(message)
        .build(),
      Format.JSON);
  }

  public boolean redirectToLogin(X x) {
    HttpServletRequest req = x.get(HttpServletRequest.class);
    String methodName = req.getMethod();
    if ( "get".equalsIgnoreCase(methodName) ) {
      return true;
    }
    return false;
  }
}
