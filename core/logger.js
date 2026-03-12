
/* ===========================
   LOGGER
=========================== */

export function logInfo(msg,data){

  console.log("[Tatame]",msg,data||"");

}

export function logError(source,err){

  console.error("[Tatame Error]",source,err);

}
