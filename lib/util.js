export const gsid = () => {
    return 'sess-xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
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