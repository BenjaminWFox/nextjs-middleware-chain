/**
 * This will not create a cryptographic quality GUID, but is sufficient
 * for identifying separate instances of `Middleware` if necessary.
 *
 * @returns a guid-like string
 */
/* eslint-disable */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
/* eslint-enable */
