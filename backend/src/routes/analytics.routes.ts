import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();

router.get('/incident-trends', ctrl.getIncidentTrends);
router.get('/severity-distribution', ctrl.getSeverityDistribution);
router.get('/severity-weighted-rate', ctrl.getSeverityWeightedRate);
router.get('/contributing-factors', ctrl.getContributingFactors);
router.get('/time-of-day', ctrl.getTimeOfDay);
router.get('/body-part-frequency', ctrl.getBodyPartFrequency);
router.get('/division-comparison', ctrl.getDivisionComparison);
router.get('/leading-indicators', ctrl.getLeadingIndicators);
router.get('/trir-dart-history', ctrl.getTrirDartHistory);
router.get('/capa-effectiveness', ctrl.getCapaEffectiveness);
router.get('/recurrence-summary', ctrl.getRecurrenceSummary);

export { router as analyticsRoutes };
