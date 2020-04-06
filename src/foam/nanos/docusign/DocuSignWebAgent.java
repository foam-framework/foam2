package foam.nanos.docusign;

import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.common.collect.Lists;

import foam.nanos.docusign.model.DocuSignSession;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

public class DocuSignWebAgent implements WebAgent {
  public DocuSignWebAgent() {
  }

  @Override
  public void execute(X x) {
    Logger              logger = (Logger) x.get("logger");
    HttpServletRequest  req  = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);


    // find session
    String sessionId = req.getParameter("state");
    Session session = (Session)
      ((DAO) x.get("localSessionDAO")).find(sessionId);
    if ( session == null || session.getContext() == null ) {
      throw new AuthenticationException("Session not found");
    }

    // find user
    User user = (User)
      ((DAO) x.get("localUserDAO")).find(session.getUserId());

    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    // DocuSign documentation interchangably calls this an
    // authorization code and an authentication code.
    String authCode = req.getParameter("code");
    if ( SafetyUtil.isEmpty(authCode) ) {
      logger.warning("empty 'code' parameter received by DocuSignWebAgent");
      try {
        resp.sendError(
          HttpServletResponse.SC_BAD_REQUEST,
          "Expected authentication code in request parameter");
      } catch (IOException e) {
        logger.error(e);
      } finally {
        return;
      }
    }

    DocuSignConfig docuSignConfig = (DocuSignConfig) x.get("docuSignConfig");
    if ( docuSignConfig == null ) {
      logger.error("No docuSignConfig in context! Sending INTERNAL_SERVER_ERROR.");
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    DocuSignAPIHelper dsAPI = new DocuSignAPIHelper.Builder(x)
      .setDocuSignConfig(docuSignConfig)
      .build();

    List<NameValuePair> tokenRequestParams = Lists.newArrayList();
    tokenRequestParams.add(new BasicNameValuePair("grant_type", "authorization_code"));
    tokenRequestParams.add(new BasicNameValuePair("code", authCode));

    // Values that we will attempt to populate
    DocuSignAccessTokens accessTokens = null;
    DocuSignUserInfo userInfo = null;

    // === STEP 1: Send the authorization code to DocuSign to get the access code
    try {
      accessTokens = dsAPI.getAccessTokens(x, authCode);
    } catch (Exception e) {
      logger.error(e);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    System.out.println(String.format(
      "Just making sure this works: [%s]",
      accessTokens.getAccessToken()));

    // === STEP 2: Request user info
    try {
      userInfo = dsAPI.getUserInfo(x, accessTokens);
    } catch (Exception e) {
      logger.error(e);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    System.out.println(String.format(
      "Just making sure this works: [%s|%s]",
      userInfo.getName(), userInfo.getAccounts()[0].getName()));

    DocuSignUserAccount defaultAccount = null;
    for ( DocuSignUserAccount acc : userInfo.getAccounts() ) {
      if ( acc.getIsDefault() ) {
        defaultAccount = acc;
        break;
      }
    }

    if ( defaultAccount == null ) {
      logger.error(
        "DocuSign did not provide a default account", userInfo
      );
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    // === STEP 3: Add information to docuSignSession
    DocuSignSession dsSession = new DocuSignSession.Builder(x)
      .setAccessTokens(accessTokens)
      .setUserInfo(userInfo)
      .setActiveAccount(defaultAccount)
      .setId(user.getId())
      .build();
    
      ((DAO) x.get("docuSignSessionDAO")).put(dsSession);
  }
}