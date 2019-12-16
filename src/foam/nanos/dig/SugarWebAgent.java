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

    try {
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

      ProxyParser jsonP =  new MapParser();
      jsonP.setX(x);
      PStream psParse = jsonP.parse(ps , psx);
      Map mapPostParam = (Map) psParse.value();

      String serviceName = (String) mapPostParam.get("service");
      if ( SafetyUtil.isEmpty(serviceName) ) {
        DigErrorMessage error = new GeneralException.Builder(x)
          .setMessage("Empty Service Key")
          .build();
        DigUtil.outputException(x, error, Format.JSON);
        return;
      }
      
      String methodName = (String) mapPostParam.get("method");
      if ( SafetyUtil.isEmpty(methodName) ) {
        DigErrorMessage error = new GeneralException.Builder(x)
          .setMessage("Empty Method Name")
          .build();
        DigUtil.outputException(x, error, Format.JSON);
        return;
      }

      String interfaceName = (String) mapPostParam.get("interfaceName");
      Class class_ = null;
      try {
        class_ = Class.forName(interfaceName);
      } catch (Exception e) {
          DigErrorMessage error = new GeneralException.Builder(x)
            .setMessage("Can not find out service interface")
            .build();
          DigUtil.outputException(x, error, Format.JSON);
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
        DigUtil.outputException(x, error, Format.JSON);
        return;
      }

      try {
        nspec.checkAuthorization(x);
      } catch (foam.nanos.auth.AuthorizationException e) {
        DigUtil.outputException(x,
          new foam.nanos.dig.exception.AuthorizationException.Builder(x)
            .setMessage(e.getMessage())
            .build(),
          Format.JSON);
        return;
      }

      Class[] paramTypes = null; // for picked Method's parameters' types
      Object  arglist[]  = null; // to store each parameters' values
      String  paramName  = null;

      if ( class_ != null ) {
        Method method_[] = class_.getMethods();  // get Methods' List from the class

        for ( int k = 0 ; k < method_.length ; k++ ) {
          if ( method_[k].getName().equals(methodName) ) { //found picked Method

            logger.debug("service : " + serviceName);
            logger.debug("methodName : " + method_[k].getName());

            Parameter[] pArray = method_[k].getParameters();
            paramTypes = new Class[pArray.length];
            arglist    = new Object[pArray.length];

            for ( int j = 0 ; j < pArray.length ; j++ ) { // checking the method's each parameter
              paramTypes[j] = pArray[j].getType();

              if ( ! pArray[j].isNamePresent() ) {
                DigErrorMessage error = new GeneralException.Builder(x)
                  .setMessage("IllegalArgumentException : Add a compiler argument (use javac -parameters)")
                  .build();
                DigUtil.outputException(x, error, Format.JSON);
                return;
              }
              // the post method
              paramName = pArray[j].getName();
              logger.debug(pArray[j].getName() + " :   " + paramName);

              // casting and setting according to parameters type
              String typeName = pArray[j].getType().getCanonicalName();

              if ( typeName.equals("foam.core.X") ) {
                arglist[j] = x;
              } else if ( paramName != null ) {
                //post method
                arglist[j] = mapPostParam.get(paramName);
              } else {
                DigErrorMessage error = new GeneralException.Builder(x)
                  .setMessage("Empty Parameter values : " + pArray[j].getName())
                  .build();
                DigUtil.outputException(x, error, Format.JSON);
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
      DigUtil.outputException(x, error, Format.JSON);
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