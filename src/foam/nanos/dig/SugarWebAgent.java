/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.X;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.dig.exception.*;
import foam.nanos.http.HttpParameters;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import foam.nanos.http.WebAgent;

import java.io.*;
import java.nio.CharBuffer;
import java.lang.Exception;
import java.lang.reflect.*;
import javax.servlet.http.HttpServletResponse;

public class SugarWebAgent
  implements WebAgent
{
  public SugarWebAgent() {}

  public void execute(X x) {
    Logger              logger         = (Logger) x.get("logger");
    PrintWriter         out            = x.get(PrintWriter.class);
    HttpServletResponse resp           = x.get(HttpServletResponse.class);
    HttpParameters      p              = x.get(HttpParameters.class);
    CharBuffer          buffer_        = CharBuffer.allocate(65535);
    String              serviceName    = p.getParameter("service");
    String              methodName     = p.getParameter("method");
    String              interfaceName  = p.getParameter("interfaceName");

    try {
      if ( SafetyUtil.isEmpty(serviceName) ) {
        DigErrorMessage error = new GeneralException.Builder(x)
          .setMessage("Empty Service Key")
          .build();
        outputException(x, resp, "JSON", out, error);

        return;
      }

      if ( SafetyUtil.isEmpty(methodName) ) {
        DigErrorMessage error = new GeneralException.Builder(x)
          .setMessage("Empty Method Name")
          .build();
        outputException(x, resp, "JSON", out, error);

        return;
      }

      Class class_ = null;
      try {
        class_ = Class.forName(interfaceName);
      } catch (Exception e) {
          DigErrorMessage error = new GeneralException.Builder(x)
            .setMessage("Can not find out service interface")
            .build();
          outputException(x, resp, "JSON", out, error);

          return;
      }

      Class[] paramTypes = null; // for picked Method's parameters' types
      Object arglist[] = null; // to store each parameters' values

      if ( class_ != null ) {
        Method method_[] = class_.getMethods();  // get Methods' List from the class

        for ( int k = 0 ; k < method_.length ; k++ ) {
          if ( method_[k].getName().equals(methodName) ) { //found picked Method

            logger.debug("service : " + serviceName);
            logger.debug("methodName : " + method_[k].getName());

            Parameter[] pArray = method_[k].getParameters();
            paramTypes = new Class[pArray.length];
            arglist = new Object[pArray.length];

            for ( int j = 0 ; j < pArray.length ; j++ ) {  // checking the method's each parameter
              paramTypes[j] = pArray[j].getType();

              if ( ! pArray[j].isNamePresent() ) {
                DigErrorMessage error = new GeneralException.Builder(x)
                  .setMessage("IllegalArgumentException : Add a compiler argument")
                  .build();
                outputException(x, resp, "JSON", out, error);
              }

              paramTypes[j] = pArray[j].getType();
              arglist[j] = p.getParameter(pArray[j].getName());

              logger.debug(pArray[j].getName() + " :   " + p.getParameter(pArray[j].getName()));

              // casting and setting according to parameters type
              String typeName = pArray[j].getType().getCanonicalName();

              if ( ! SafetyUtil.isEmpty(p.getParameter(pArray[j].getName())) ) {
                switch (typeName) {
                  case "double":
                    arglist[j] = Double.parseDouble(p.getParameter(pArray[j].getName()));
                    break;
                  case "boolean":
                    arglist[j] = Boolean.parseBoolean(p.getParameter(pArray[j].getName()));
                    break;
                  case "int":
                    arglist[j] = Integer.parseInt(p.getParameter(pArray[j].getName()));
                    break;
                  case "long":
                    arglist[j] = Long.parseLong(p.getParameter(pArray[j].getName()));
                    break;
                  case "java.lang.String":
                    arglist[j] = p.getParameter(pArray[j].getName());
                    break;
                  default:
                    DigErrorMessage error = new GeneralException.Builder(x)
                      .setMessage("Parameter Type Exception")
                      .build();
                    outputException(x, resp, "JSON", out, error);
                }

                executeMethod(x, resp, out, class_, serviceName, methodName, paramTypes, arglist);
              } else {
                DigErrorMessage error = new GeneralException.Builder(x)
                  .setMessage("Empty Parameter values : " + pArray[j].getName())
                  .build();
                outputException(x, resp, "JSON", out, error);
              }
            }
          }
        }
      }

    } catch (Exception e) {
      logger.error(e);

      return;
    }
  }

  protected void executeMethod(X x, HttpServletResponse resp, PrintWriter out, Class class_, String serviceName, String methodName, Class[] paramTypes, Object arglist[]) {
    try {
      Method declaredMethod_ = class_.getDeclaredMethod(methodName, paramTypes);
      declaredMethod_.setAccessible(true);
      //declaredMethod_.invoke(x.get(serviceName), arglist);

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      resp.setContentType("application/json");

      Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);

      outputterJson.output(declaredMethod_.invoke(x.get(serviceName), arglist));
      out.println(outputterJson);
    } catch (InvocationTargetException e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage("InvocationTargetException: " + e.getTargetException().getMessage())
        .build();
      outputException(x, resp, "JSON", out, error);
    } catch (Exception e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage("Exception: " + e.getMessage())
        .build();
      outputException(x, resp, "JSON", out, error);
    }
  }

  protected void outputException(X x, HttpServletResponse resp, String format, PrintWriter out, DigErrorMessage error) {
    resp.setStatus(Integer.parseInt(error.getStatus()));
    format = "JSON";  // Currently supporting only JSON

    if ( format.equals("JSON") ) {
      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);

      Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.output(error);

      out.println(outputterJson.toString());
    }

    return;
  }
}
