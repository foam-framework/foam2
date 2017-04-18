package com.google.foam.demos.appengine;

public interface TestService {
    public void doLog(String message);

    public void setValue(String value);

    public String getValue();

}