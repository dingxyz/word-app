import express from 'express';
import {getAllWordStatistics, setWordStatistics} from "../controllers/wordStatisticsController.mjs";


const router = express.Router();

router.get('/', getAllWordStatistics);

router.post('/', setWordStatistics);

export default router;
