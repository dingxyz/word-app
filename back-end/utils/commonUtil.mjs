import {db} from "../db/initDatabase.mjs";
import {WORD_TYPE} from "../controllers/wordsController.mjs";

export const generateUniqueId = () => 'id-' + Date.now() + '-' + Math.floor(Math.random() * 10000)

const capitalizeFirstLetter = async () => {
    await db.read();
    Object.values(WORD_TYPE).forEach(type => {
        if (db.data[type]) {
            db.data[type].forEach(word => {
                word.english = word.english.charAt(0).toUpperCase() + word.english.slice(1);
            });
        }
    });
    await db.write();
};