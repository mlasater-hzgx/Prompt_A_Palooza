import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import * as analyticsService from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export async function getExecutiveDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getExecutiveDashboard({
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function getDivisionDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDivisionDashboard(String(req.params.divisionId));
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function getProjectDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getProjectDashboard(String(req.params.projectNumber));
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function getIncidentTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 12;
    const data = await analyticsService.getIncidentTrends(months);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function getSeverityDistribution(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getSeverityDistribution()); } catch (err) { next(err); }
}

export async function getContributingFactors(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getContributingFactorFrequency()); } catch (err) { next(err); }
}

export async function getTimeOfDay(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getTimeOfDayHeatmap()); } catch (err) { next(err); }
}

export async function getBodyPartFrequency(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getBodyPartFrequency()); } catch (err) { next(err); }
}

export async function getDivisionComparison(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getDivisionComparison()); } catch (err) { next(err); }
}

export async function getLeadingIndicators(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getLeadingIndicators()); } catch (err) { next(err); }
}

export async function getTrirDartHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 12;
    const data = await analyticsService.getTrirDartHistory(months);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function getSeverityWeightedRate(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getSeverityWeightedRate()); } catch (err) { next(err); }
}

export async function getCapaEffectiveness(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getCapaEffectiveness()); } catch (err) { next(err); }
}

export async function getRecurrenceSummary(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await analyticsService.getRecurrenceSummary()); } catch (err) { next(err); }
}
