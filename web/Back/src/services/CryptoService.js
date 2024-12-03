import CryptoJS from "crypto-js";

const SECRET_KEY = "0Ji210NaW5CkikcsqIWCc8PxexA9jmUf";

const CryptoService = {
    encrypt(data) {
        const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
        return ciphertext;
    },
    decrypt(encryptedData) {
        try {
            const decodedData = Buffer.from(encryptedData, "base64").toString("utf-8");
            const bytes = CryptoJS.AES.decrypt(decodedData, SECRET_KEY);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedData) {
                throw new Error("Les données décryptées sont vides.");
            }

            return JSON.parse(decryptedData);
        } catch (error) {
            console.error("Erreur lors du déchiffrement :", error.message);
            throw new Error("Impossible de déchiffrer les données.");
        }
    },
};

export default CryptoService;
