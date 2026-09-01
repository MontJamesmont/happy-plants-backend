const validateBase64ImageSize = (value) => {
  if (!value) return true;
  try {
    const size = Buffer.byteLength(value, "base64");
    return size <= 2 * 1024 * 1024;
  } catch (err) {
    return false;
  }
}

module.exports = validateBase64ImageSize;