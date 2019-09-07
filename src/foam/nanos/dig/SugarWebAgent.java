/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.dao.DAO;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.lib.AndPropertyPredicate;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.PermissionedPropertyPredicate;
import foam.lib.PropertyPredicate;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.exception.*;
import foam.nanos.http.HttpParameters;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import foam.nanos.http.WebAgent;

import java.io.*;
import java.lang.Exception;
import java.lang.reflect.*;
import java.nio.CharBuffer;
import javax.servlet.http.HttpServletResponse;
import java.util.Iterator;
import java.util.List;

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

      // Check if the user is authorized to access the DAO.
      DAO nSpecDAO = (DAO) x.get("nSpecDAO");
      NSpec nspec = (NSpec) nSpecDAO.find(serviceName);

      // Check if service exists and is served.
      if ( nspec == null || ! nspec.getServe() ) {
        DigErrorMessage error = new GeneralException.Builder(x)
          .setMessage(String.format("Could not find service named '%s'", serviceName))
          .build();
        outputException(x, resp, "JSON", out, error);
        return;
      }

      try {
        nspec.checkAuthorization(x);
      } catch (foam.nanos.auth.AuthorizationException e) {
        outputException(x, resp, "JSON", out, new foam.nanos.dig.exception.AuthorizationException.Builder(x)
          .setMessage(e.getMessage())
          .build());
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
                return;
              }

              paramTypes[j] = pArray[j].getType();
              arglist[j] = p.getParameter(pArray[j].getName());

              logger.debug(pArray[j].getName() + " :   " + p.getParameter(pArray[j].getName()));

              // casting and setting according to parameters type
              String typeName = pArray[j].getType().getCanonicalName();
              Class paramObj_ = null;
              Object obj_ = null;

              if ( typeName.equals("foam.core.X") ) {
                arglist[j] = x;
              } else if ( ! SafetyUtil.isEmpty(p.getParameter(pArray[j].getName())) ) {
                arglist[j] = setParameterValue(x, resp, out, p, typeName, pArray[j]);
              } else {
                DigErrorMessage error = new GeneralException.Builder(x)
                  .setMessage("Empty Parameter values : " + pArray[j].getName())
                  .build();
                outputException(x, resp, "JSON", out, error);
                return;
              }
            }
            executeMethod(x, resp, out, class_, serviceName, methodName, paramTypes, arglist);
          }
        }
      }

    } catch (Exception e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage(e.toString())
        .build();
      outputException(x, null, "JSON", null, error);
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

      Outputter outputterJson = new Outputter(x).setPropertyPredicate(new AndPropertyPredicate(x, new PropertyPredicate[] {new NetworkPropertyPredicate(), new PermissionedPropertyPredicate()}));
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
        .setMessage("Exception: " + e.toString())
        .build();
      outputException(x, resp, "JSON", out, error);
    }
  }

  protected void outputException(X x, HttpServletResponse resp, String format, PrintWriter out, DigErrorMessage error) {
    if ( resp == null ) resp = x.get(HttpServletResponse.class);

    if ( out == null ) out = x.get(PrintWriter.class);

    resp.setStatus(Integer.parseInt(error.getStatus()));
    format = "JSON";  // Currently supporting only JSON

    if ( format.equals("JSON") ) {
      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);

      Outputter outputterJson = new foam.lib.json.Outputter(x).setPropertyPredicate(new AndPropertyPredicate(x, new PropertyPredicate[] {new NetworkPropertyPredicate(), new PermissionedPropertyPredicate()}));
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.output(error);

      out.println(outputterJson.toString());
    }

    return;
  }

  protected Object getFieldInfo(X x, String className, HttpParameters p) {  // For Obj Parameters
    Class clsForObj = null;
    Object clsObj = null;

    try {
      clsForObj = Class.forName(className);

      clsObj = clsForObj.newInstance();
      Field[] fieldList = clsForObj.getDeclaredFields();

      List axioms = ((foam.core.FObject) clsObj).getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator it = axioms.iterator();

      while (it.hasNext()) {
        PropertyInfo prop = (PropertyInfo) it.next();

        for (int m = 0; m < fieldList.length; m++)
          if (fieldList[m].getName().equals(prop.getName().toUpperCase())) {
            fieldList[m].setAccessible(true);
            Field modifiersField = (Field.class).getDeclaredField("modifiers");
            modifiersField.setAccessible(true);
            modifiersField.set(fieldList[m], fieldList[m].getModifiers() & ~Modifier.STATIC);

            if (!SafetyUtil.isEmpty(p.getParameter(prop.getName()))) {
              if (prop.getValueClass().toString().equals("class [Ljava.lang.String;")) {  //String[]
                prop.set(clsObj, p.getParameterValues(prop.getName()));
              } else {
                prop.set(clsObj, p.getParameter(prop.getName()));
              }

              fieldList[m].set(clsObj, prop);
          }
        }
      }
    } catch (Exception e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage(e.toString())
        .build();
      outputException(x, null, "JSON", null, error);
    }

    return clsObj;
  }

  protected Object setParameterValue(X x, HttpServletResponse resp, PrintWriter out, HttpParameters p, String typeName, Parameter pArray_) {
    Object arg = null;

    if ( ! SafetyUtil.isEmpty(typeName) ) {
      switch ( typeName ) {
        case "double":
          arg = Double.parseDouble(p.getParameter(pArray_.getName()));
          break;
        case "boolean":
          arg = Boolean.parseBoolean(p.getParameter(pArray_.getName()));
          break;
        case "int":
          arg = Integer.parseInt(p.getParameter(pArray_.getName()));
          break;
        case "long":
          arg = Long.parseLong(p.getParameter(pArray_.getName()));
          break;
        case "java.lang.String":
          arg = p.getParameter(pArray_.getName());
          break;
        case "String[]":
          arg = p.getParameterValues(pArray_.getName());
          break;
        case "foam.core.X":
          arg = x;
          break;
        default:
          Class objClass = null;

          try {
            objClass = Class.forName(typeName);

            if ( objClass != null && objClass.isEnum() ) {  // For Enum Parameter
              for ( int t = 0 ; t < objClass.getEnumConstants().length ; t++ ) {
                if ( objClass.getEnumConstants()[t].toString().equals(p.getParameter(pArray_.getName())) ) {
                  arg = objClass.getEnumConstants()[t];
                }
              }
            } else {
              arg = getFieldInfo(x, typeName, p);  // For Object Parameter
            }
          } catch (Exception e) {
            DigErrorMessage error = new GeneralException.Builder(x)
              .setMessage(e.toString())
              .build();
            outputException(x, null, "JSON", null, error);


          }
      }
    }

    return arg;
  }
}
