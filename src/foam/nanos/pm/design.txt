PM:
Records information and is sent to PMLogger
class PM {
    PM(this.class, name) -> marks down time
    getName() -> returns name
    getClass() -> returns classtype
    getTime() -> returns time taken
    log(X) -> records time since creation {
                 PMLogger logger = (PMLogger) X.get('PMLogger');
                 logger.log(this);
               }
};


PMInfo:
A collection of data that is accessed through the PMDAO
records ->
    the class, and name associated with the PM
    count (number of occurrences)
    maximum time
    minimum time
    average time
    total time


Interface PMLogger:
class PMLogger {
    log(PM) -> attempts to find a PMInfo in the PMDAO, if it finds it, it will update it, if it can't it will create a new one.
}

log(PM) will need to be implemented, for example a DAOPMLogger will take the PM, and use the PMInfoDAO to update a PMInfo


PMInfoDAO:
Provides an interface to the PMInfo database for reading and writing

PMDAO
Decorate DAO interface to add PM LoggingDAO
