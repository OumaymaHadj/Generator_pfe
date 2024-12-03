import CryptoJS from "crypto-js";

const SECRET_KEY = "0Ji210NaW5CkikcsqIWCc8PxexA9jmUf";
const CryptoService = {
  /**
   * Crypte les données avec une clé secrète.
   * @param {Object} data - 
   * @returns {string} - 
   */
  encrypt(data) {
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY
    ).toString();
    return btoa(ciphertext); // Encodage en base64
  },

  /**
   * Décrypte les données avec une clé secrète.
   * @param {string} encryptedData - 
   * @returns {Object} -
   */
  decrypt(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  },
};

export default CryptoService;
