package foam.nanos.dig;

import foam.nanos.http.WebAgent;
import foam.core.X;
import foam.nanos.logger.Logger;
import java.io.*;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.boot.NSpec;
import foam.core.Detachable;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import foam.nanos.http.HttpParameters;
import javax.servlet.ServletException;
import java.nio.CharBuffer;
import foam.util.SafetyUtil;
import foam.core.FObject;
import net.nanopay.fx.ExchangeRateService;
import org.apache.http.impl.auth.GGSSchemeBase;

import java.lang.reflect.*;

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
      if ( !SafetyUtil.isEmpty(serviceName) ) {
        //outputPage(x);
      }

      Class c = Class.forName(interfaceName); //"net.nanopay.fx.ExchangeRateInterface"  "net.nanopay.fx.ExchangeRateService"
      //Object objClass = c.newInstance();

      Method m[] = c.getMethods();  // get Methods' List
      //c.getMethod(methodName, ).invoke();


      Object arglist[] = null;
      Class[] paramTypes = null; // for picked Method's parameters' types

      for ( int k = 0; k < m.length; k++ ) {
        if ( m[k].getName().equals(methodName) ) { //found picked Method

          System.out.println("service : " + serviceName);
          System.out.println("methodName : " + m[k].getName());

          Parameter[] pArray = m[k].getParameters();
          paramTypes = new Class[pArray.length];
          arglist = new Object[pArray.length];

          for ( int j = 0; j < pArray.length; j++ ) {
            paramTypes[j] = pArray[j].getType();

            if (!pArray[j].isNamePresent()) {
              throw new IllegalArgumentException("No defined parameter name");
            }

            paramTypes[j] = pArray[j].getType();
            arglist[j] = p.getParameter(pArray[j].getName());

            System.out.println(pArray[j].getName() + " :   " + p.getParameter(pArray[j].getName()));
            System.out.println("pArray[j].getType() :   " + pArray[j].getType().getCanonicalName());
            System.out.println("arglist :   " + j + "   " + arglist[j]);
            System.out.println(" paramTypes[j] : " + paramTypes[j].isPrimitive());

            //if ( (Object) paramTypes[j] instanceof java.lang.String) {
            if (pArray[j].getType().getCanonicalName().equals("double")){
              arglist[j] = Double.parseDouble(p.getParameter(pArray[j].getName()));
              System.out.println(j + "  doubledddd");
            } else if ( pArray[j].getType().getCanonicalName().equals("int") ){
              System.out.println(j + "  instanceOf int");
              arglist[j] = Integer.parseInt(p.getParameter(pArray[j].getName()));
            } else if ( pArray[j].getType().getCanonicalName().equals("boolean") ){
              System.out.println(j + "  instanceOf boolean");
              arglist[j] = Boolean.parseBoolean(p.getParameter(pArray[j].getName()));
            } else if ( pArray[j].getType().getCanonicalName().equals("long") ){
              System.out.println(j + "  instanceOf long");
              arglist[j] = Long.parseLong(p.getParameter(pArray[j].getName()));
            } else if ( paramTypes[j].isInstance("java.lang.String") ) {
              System.out.println(j + "  instanceOf String");
              arglist[j] = p.getParameter(pArray[j].getName());
            } else if ( paramTypes[j].isInstance("java.lang.Double") ){
              System.out.println(j + "  instanceOf java.lang.Double");
              arglist[j] = p.getParameter(pArray[j].getName());
            } else if ( paramTypes[j].isInstance("java.lang.Long")  ){
              System.out.println(j + "  instanceOf ava.lang.Long");
              arglist[j] = p.getParameter(pArray[j].getName());
            } else if ( paramTypes[j].isInstance("java.lang.Integer") ) {
              System.out.println(j + "  instancesOf java.lang.Integer");
              arglist[j] = p.getParameter(pArray[j].getName());
            } else if ( paramTypes[j].isInstance("java.lang.Number") ) {
              System.out.println(j + "  instancesOf java.lang.Number");
              arglist[j] = p.getParameter(pArray[j].getName());
            } else {
              System.out.println(j + "  else else");
            }
          }





//          for ( Parameter parameter : pArray ) {
//            if( ! parameter.isNamePresent() ) {
//              throw new IllegalArgumentException("No defined parameter name");
//            }
//
//            //String parameterName = parameter.getName();
//            //System.out.println("parameterName : " +  parameterName);
//
//            paramTypes = parameter.getType();
//
//            System.out.println(parameter.getName() + " :   " + p.getParameter(parameter.getName()));
//            System.out.println("parameter.getType() :   " + parameter.getType());
//          }

//          for ( paramTypes[j] = pArray[j].getType(); ) {
//
//          }
        }
      }
//            for ( int j = 0; j < pArray.length; j++ ) {
//              paramTypes[j] = pArray[j].getType();
//
//              if ( ! pArray[j].isNamePresent() ) {
//                throw new IllegalArgumentException("No defined parameter name");
//              }
//
//              paramTypes[j] = pArray[j].getType();
//
//              System.out.println(pArray[j].getName() + " :   " + p.getParameter(pArray[j].getName()));
//              System.out.println("pArray[j].getType() :   " + pArray[j].getType());
//
//              System.out.println("ParamTypes : " +  paramTypes[j]);
//
//              System.out.println("Paratmeter Type : " +  pArray[j].getType());
//              System.out.println("Paratmeter Name : " +  pArray[j].getName());
//              System.out.println("m[k].getParameterCount() : " +  m[k].getParameterCount());
//
//              for(Parameter parameter : pArray) {
////                if(!parameter.isNamePresent()) {
////                  throw new IllegalArgumentException("error !!");
////                }
//                String parameterName = parameter.getName();
//                System.out.println("parameterName : " +  parameterName);
//              }
//            }
//        }
//      }

      //arglist[0] = (long)1348;
//      arglist[1] = "2";
//      arglist[2] = 3.0;
//      arglist[3] = "4";

      //System.out.println(" x.get(serviceName) : " + x.get);

      //net.nanopay.fx.localfx.LocalFXServiceAdapter localFXService = (net.nanopay.fx.localfx.LocalFXServiceAdapter) x.get("localFXService");
      // **********
      try {
        Method mm1 = c.getDeclaredMethod(methodName, paramTypes);
        mm1.setAccessible(true);
        mm1.invoke(x.get(serviceName), arglist);
        //mm1.invoke(localFXService, arglist);

        System.out.println(mm1.invoke(x.get(serviceName), arglist));
      } catch (InvocationTargetException e) {
        logger.error(e);
        System.out.println("errororororo: " + e.getTargetException().getMessage());
        return;
      } catch (Exception e) {
        logger.error(e);
        System.out.println("errororororo: " + e.getMessage());
        return;
      }
      // **********


      for ( int i = 0; i < x.get(serviceName).getClass().getMethods().length; i++ ) {
        if ( x.get(serviceName).getClass().getMethods()[i].getName().equals(methodName) ) {
          for ( int j = 0; j < x.get(serviceName).getClass().getMethods()[i].getParameterCount(); j++ ) {
            System.out.println("here I am");
            System.out.println("j : " + x.get(serviceName).getClass().getMethods()[j].getParameterCount());

            if ( x.get(serviceName).getClass().getMethods()[j].getParameterCount() > 0 )
            System.out.println("j Name : " + x.get(serviceName).getClass().getMethods()[j].getParameters()[j].getName());
          }
        }

//        System.out.println("getMethods[] : " + x.get("exchangeRate").getClass().getMethods()[i]);
//        System.out.println("getName : " + x.get("exchangeRate").getClass().getMethods()[i].getName());
//        System.out.println("getParameterTypes : " + x.get("exchangeRate").getClass().getMethods()[i].getParameterTypes());
//        System.out.println("getGenericParameterTypes : " + x.get("exchangeRate").getClass().getMethods()[i].getGenericParameterTypes());
//        System.out.println("getParameterCount : " + x.get("exchangeRate").getClass().getMethods()[i].getParameterCount());
//        System.out.println("getReturnType : " + x.get("exchangeRate").getClass().getMethods()[i].getReturnType());
        //System.out.println("ParamName : " + x.get("exchangeRate").getClass().getMethods()[i].getParameters());
      }
    } catch (Exception e) {
      logger.error(e);

      return;
    }
  }
}
