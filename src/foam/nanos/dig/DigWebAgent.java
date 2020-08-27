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
    } catch (Throwable t) {
      PrintWriter out = x.get(PrintWriter.class);
      out.println("Error " + t.getMessage());
      out.println("<pre>");
        t.printStackTrace(out);
      out.println("</pre>");
      logger.error(t);

      try {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, t.getMessage());
      } catch ( java.io.IOException e ) {
        logger.error("Failed to send HttpServletResponse CODE", e);
      }
    } finally {
      pm.log(x);
    }
  }
}
