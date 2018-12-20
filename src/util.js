export const gsid = () => {
    return 'xxyxx-xxxx-yxxx-yxxx-'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0,
            v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }) + Date.now();
}

export const pick = (obj, keys) => {
  keys = keys || Object.keys(obj);
  let result = {};
  keys.reduce((preV, curV, index) => {
    result[curV] = obj[curV];
    return result;
  }, result);
  return result;
}