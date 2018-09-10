
export function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}


export function toMap(l) {
  let map = {};
  l.forEach(function(e) {
    map[e.name] = e;
  });
  return map;
}

export function deepCopyToKey(dst, k, src, setter, deleter){
  deepCopyRec(dst[k], src, setter, deleter) || setter(dst, k, src)
}


function deepCopyRec(dst, src, setter, deleter) {
  if(dst == src) {
    return true;
  }
  if(dst === null || dst === undefined) {
    return false;
  }
  if(Array.isArray(src)) {
    
    dst.forEach( (v, i) => {
      if(src[i] == undefined) {
        deleter(src, i)
      }
    });
    src.forEach( (v, i) => {
      deepCopyToKey(dst, i, src[i], setter, deleter)
    });
    return true;
  }
  if(typeof dst === 'object'){
    Object.keys(dst).forEach( (v) => {
      deepCopyToKey(dst, v, src[v], setter, deleter)
    });
    return true;
  }
  return false;
}

export function deepCopy(dst, src, setter, deleter) {
  deepCopyRec(dst, clone(src), setter, deleter);
}
