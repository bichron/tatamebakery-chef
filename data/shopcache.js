/*
  EXPERIMENTAL - NOT IN USE
  Lazy data loading (future upgrade)
*/
const groupCache = new Map();

export async function loadGroupData(groupId){
  if(groupCache.has(groupId)){
    return groupCache.get(groupId);
  }

  const res = await fetch(`./assets/shop/${groupId}.json`);
  const data = await res.json();

  groupCache.set(groupId, data);
  return data;
}
