function stop_event(evt){
  evt.stopPropagation();
  evt.preventDefault() ;
  try
  {
    ContextualHelp.adapt
  } catch(err) { F.error(err) }
  return false ;
}
