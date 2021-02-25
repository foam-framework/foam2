/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.AndPropertyPredicate;
import foam.lib.ExternalPropertyPredicate;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.PermissionedPropertyPredicate;
import foam.lib.PropertyPredicate;
import foam.lib.json.JSONParser;
import foam.lib.json.MapParser;
import foam.lib.json.Outputter;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.StringPStream;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.exception.DigErrorMessage;
import foam.nanos.dig.exception.GeneralException;
import foam.nanos.http.Format;
import foam.nanos.http.HttpParameters;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;

public class SugarWebAgent
  implements WebAgent
{
  public SugarWebAgent() {}

  public void execute(X x) {
    Logger              logger         = (Logger) x.get("logger");
    PrintWriter         out            = x.get(PrintWriter.class);
    HttpServletResponse resp           = x.get(HttpServletResponse.class);
    HttpParameters      p              = x.get(HttpParameters.class);
    String              data           = p.getParameter("data");

    var pm = new PM(SugarWebAgent.class.getSimpleName(), "");

    try {
      if ( out == null ) {
        out = resp.getWriter();
        x = x.put(java.io.PrintWriter.class, out);
      }

      if ( SafetyUtil.isEmpty(data) ) {
        DigErrorMessage error = new GeneralException.Builder(x)
          .setMessage("Empty data")
          .build();
        DigUtil.outputException(x, error, Format.JSON);
        return;
      }

      PStream ps = new StringPStream(data);
      ParserContext psx = new ParserContextImpl();
      psx.set("X", x);

      ProxyParser jsonP = (ProxyParser) MapParser.instance();
      jsonP.setX(x);
      PStream psParse = jsonP.parse(ps , psx);
      Map mapPostParam = (Map) psParse.value();

      String serviceName = (String) mapPostParam.get("service");
      pm.setName("sugar" + serviceName);
      if ( SafetyUtil.isEmpty(serviceName) ) {
        throw new RuntimeException("Empty Service Key");
      }

      String methodName = (String) mapPostParam.get("method");
      if ( SafetyUtil.isEmpty(methodName) ) {
        throw new RuntimeException("Empty Method Name");
      }

      String interfaceName = (String) mapPostParam.get("interfaceName");
      Class class_;
      try {
        class_ = Class.forName(interfaceName);
      } catch (Exception e) {
          throw new RuntimeException("Can not find out service interface");
      }

      // Check if the user is authorized to access the DAO.
      DAO nSpecDAO = (DAO) x.get("nSpecDAO");
      NSpec nspec = (NSpec) nSpecDAO.find(serviceName);

      // Check if service exists and is served.
      if ( nspec == null || ! nspec.getServe() ) {
        throw new RuntimeException(String.format("Could not find service named '%s'", serviceName));
      }

      try {
        nspec.checkAuthorization(x);
      } catch (foam.nanos.auth.AuthorizationException e) {
        throw new RuntimeException(e.getMessage());
      }

      Class[] paramTypes; // for picked Method's parameters' types
      Object[] arglist; // to store each parameters' values
      String  paramName;

      Method[] method_ = class_.getMethods();  // get Methods' List from the class

      for (var method : method_) {
        if (method.getName().equals(methodName)) { //found picked Method

          logger.debug("service : " + serviceName);
          logger.debug("methodName : " + method.getName());

          Parameter[] pArray = method.getParameters();
          paramTypes = new Class[pArray.length];
          arglist = new Object[pArray.length];

          for (int j = 0; j < pArray.length; j++) { // checking the method's each parameter
            paramTypes[j] = pArray[j].getType();

            if (!pArray[j].isNamePresent()) {
              throw new RuntimeException("IllegalArgumentException : Add a compiler argument (use javac -parameters)");
            }
            // the post method
            paramName = pArray[j].getName();
            logger.debug(pArray[j].getName() + " :   " + paramName);

            // casting and setting according to parameters type
            String typeName = pArray[j].getType().getCanonicalName();

            if (typeName.equals("foam.core.X")) {
              arglist[j] = x;
            } else if (paramName != null) {
              //post method
              arglist[j] = mapPostParam.get(paramName);
            } else {
              throw new RuntimeException("Empty Parameter values : " + pArray[j].getName());
            }
          }
          executeMethod(x, resp, out, class_, serviceName, methodName, paramTypes, arglist);
        }
      }

    } catch (Exception e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage(e.toString())
        .build();
      DigUtil.outputException(x, error, Format.JSON);
      pm.error(x, e.getMessage());
    } finally {
      pm.log(x);
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

      Outputter outputterJson = new Outputter(x).setPropertyPredicate(
        new AndPropertyPredicate(x, new PropertyPredicate[] {
          new ExternalPropertyPredicate(),
          new NetworkPropertyPredicate(),
          new PermissionedPropertyPredicate()}));
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);

      outputterJson.output(declaredMethod_.invoke(x.get(serviceName), arglist));
      out.println(outputterJson);
    } catch (InvocationTargetException e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage("InvocationTargetException: " + e.getTargetException().getMessage())
        .build();
      DigUtil.outputException(x, error, Format.JSON);
    } catch (Exception e) {
      DigErrorMessage error = new GeneralException.Builder(x)
        .setMessage("Exception: " + e.toString())
        .build();
      DigUtil.outputException(x, error, Format.JSON);
    }
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
      DigUtil.outputException(x, error, Format.JSON);
    }

    return clsObj;
  }
}
