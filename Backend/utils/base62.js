
const CHARS="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Converts a base-10 integer into a Base62 string
 * @param {number|string|bigint} num - The auto-incremented database ID
 * @returns {string} - The unique 7-character short code
 */

export function encode(num){
  let id=BigInt(num);

  if(id===0n){
    return CHARS[0];
  }

  let shortCode="";
  const base=62n;

  while(id>0n){
    const rem=id%base;
    shortCode=CHARS[Number(rem)]+shortCode;
    id=id/base;
  }

  return shortCode;
}