import { Request, Response, NextFunction } from 'express';
import * as incidentsService from '../services/incidents.service';
import { sendSuccess, sendPaginated, buildPaginationMeta } from '../utils/response';

// ---------------------------------------------------------------------------
// List Incidents
// ---------------------------------------------------------------------------

export async function listIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as Record<string, string>;

    // Determine scoping based on user role
    let scopedProjectNumbers: string[] | undefined;
    let scopedDivision: string | undefined;

    if (req.user?.role === 'PROJECT_MANAGER') {
      // PROJECT_MANAGER only sees incidents for their assigned projects
      // This would be populated from user-project associations
      scopedProjectNumbers = [];
    } else if (req.user?.role === 'DIVISION_MANAGER') {
      // DIVISION_MANAGER only sees incidents for their division
      scopedDivision = req.user.division ?? undefined;
    }

    const { incidents, count } = await incidentsService.listIncidents(
      filters,
      req.pagination.skip,
      req.pagination.take,
      scopedProjectNumbers,
      scopedDivision,
    );

    sendPaginated(
      res,
      incidents,
      buildPaginationMeta(req.pagination.page, req.pagination.pageSize, count),
    );
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Get Incident
// ---------------------------------------------------------------------------

export async function getIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentsService.getIncidentById(String(req.params.id));
    sendSuccess(res, incident);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Create Incident
// ---------------------------------------------------------------------------

export async function createIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentsService.createIncident(req.body, req.user!.id);
    sendSuccess(res, incident, 201);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Update Incident
// ---------------------------------------------------------------------------

export async function updateIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentsService.updateIncident(String(req.params.id), req.body);
    sendSuccess(res, incident);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Complete Details
// ---------------------------------------------------------------------------

export async function completeDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentsService.completeDetails(String(req.params.id), req.body);
    sendSuccess(res, incident);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Transition Status
// ---------------------------------------------------------------------------

export async function transitionStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentsService.transitionStatus(
      String(req.params.id),
      req.body.status,
    );
    sendSuccess(res, incident);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Get Timeline
// ---------------------------------------------------------------------------

export async function getTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const timeline = await incidentsService.getIncidentTimeline(String(req.params.id));
    sendSuccess(res, timeline);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Get Statements
// ---------------------------------------------------------------------------

export async function getStatements(req: Request, res: Response, next: NextFunction) {
  try {
    const statements = await incidentsService.getIncidentStatements(String(req.params.id));
    sendSuccess(res, statements);
  } catch (err) {
    next(err);
  }
}
