package com.google.foam.demos.appengine;

import com.google.foam.demos.appengine.TestService;

public class TestServiceImpl implements TestService {
  public void doLog(String message) {
    System.out.println("Message is: " + message);
  }

  private String value_ = "value";
  public void setValue(String value) {
    value_ = value;
  }

  public String getValue() {
    return value_;
  }
}
