import express from 'express';
import {getAllPlayStatistics, setPlayStatistics} from "../controllers/playStatisticsController.mjs";


const router = express.Router();

router.get('/', getAllPlayStatistics);

router.post('/', setPlayStatistics);

export default router;
