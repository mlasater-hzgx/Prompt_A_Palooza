-- CreateEnum
CREATE TYPE "Division" AS ENUM ('HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('INJURY', 'NEAR_MISS', 'PROPERTY_DAMAGE', 'ENVIRONMENTAL', 'VEHICLE', 'FIRE', 'UTILITY_STRIKE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('FIRST_AID', 'MEDICAL_TREATMENT', 'RESTRICTED_DUTY', 'LOST_TIME', 'FATALITY', 'NEAR_MISS', 'PROPERTY_ONLY');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('DAY', 'NIGHT', 'SWING');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETE', 'CAPA_ASSIGNED', 'CAPA_IN_PROGRESS', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "InjuryType" AS ENUM ('LACERATION', 'FRACTURE', 'STRAIN_SPRAIN', 'CONTUSION', 'BURN', 'AMPUTATION', 'RESPIRATORY', 'HEARING', 'EYE', 'OTHER');

-- CreateEnum
CREATE TYPE "BodyPart" AS ENUM ('HEAD', 'EYES', 'NECK', 'SHOULDER', 'ARM', 'HAND', 'FINGER', 'BACK', 'CHEST', 'ABDOMEN', 'HIP', 'LEG', 'KNEE', 'FOOT', 'TOE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('LEFT', 'RIGHT', 'BOTH', 'NA');

-- CreateEnum
CREATE TYPE "TreatmentType" AS ENUM ('NONE', 'FIRST_AID', 'ER_VISIT', 'HOSPITALIZATION', 'ONGOING_TREATMENT');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETE');

-- CreateEnum
CREATE TYPE "RootCauseMethod" AS ENUM ('FIVE_WHY', 'FISHBONE', 'BOTH');

-- CreateEnum
CREATE TYPE "FishboneCategory" AS ENUM ('PEOPLE', 'PROCESS', 'EQUIPMENT', 'MATERIALS', 'ENVIRONMENT', 'MANAGEMENT');

-- CreateEnum
CREATE TYPE "FactorCategory" AS ENUM ('HUMAN_FACTORS', 'EQUIPMENT_TOOLS', 'ENVIRONMENTAL', 'PROCEDURAL', 'MANAGEMENT_ORGANIZATIONAL');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CORRECTIVE', 'PREVENTIVE');

-- CreateEnum
CREATE TYPE "CapaCategory" AS ENUM ('TRAINING', 'PROCEDURE_CHANGE', 'ENGINEERING_CONTROL', 'PPE', 'EQUIPMENT_MODIFICATION', 'DISCIPLINARY', 'POLICY_CHANGE', 'OTHER');

-- CreateEnum
CREATE TYPE "CapaPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CapaStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFICATION_PENDING', 'VERIFIED_EFFECTIVE', 'VERIFIED_INEFFECTIVE', 'OVERDUE');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE');

-- CreateEnum
CREATE TYPE "SimilarityType" AS ENUM ('SAME_LOCATION', 'SAME_TYPE', 'SAME_ROOT_CAUSE', 'SAME_EQUIPMENT', 'SAME_PERSON');

-- CreateEnum
CREATE TYPE "DetectedBy" AS ENUM ('SYSTEM', 'MANUAL');

-- CreateEnum
CREATE TYPE "RailroadClient" AS ENUM ('BNSF', 'UP', 'CSX', 'NS', 'CN', 'KCS', 'NA');

-- CreateEnum
CREATE TYPE "ReviewAction" AS ENUM ('APPROVED', 'RETURNED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FIELD_REPORTER', 'SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'PROJECT_MANAGER', 'DIVISION_MANAGER', 'EXECUTIVE', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INCIDENT_REPORTED', 'INVESTIGATION_ASSIGNED', 'INVESTIGATION_OVERDUE', 'CAPA_ASSIGNED', 'CAPA_OVERDUE', 'CAPA_VERIFICATION_DUE', 'CLIENT_DEADLINE', 'RECURRENCE_DETECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "azure_ad_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "division" "Division",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "project_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" "Division" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_projects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_number" TEXT NOT NULL,

    CONSTRAINT "user_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "incident_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "incident_type" "IncidentType" NOT NULL,
    "incident_date" DATE NOT NULL,
    "incident_time" TIME,
    "reported_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reported_by_id" UUID NOT NULL,
    "division" "Division" NOT NULL,
    "project_number" TEXT,
    "job_site" TEXT,
    "location_description" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "description" TEXT NOT NULL,
    "immediate_actions_taken" TEXT,
    "weather_conditions" TEXT,
    "shift" "Shift",
    "severity" "Severity",
    "potential_severity" "Severity",
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "is_osha_recordable" BOOLEAN,
    "osha_case_number" TEXT,
    "is_dart" BOOLEAN,
    "days_away" INTEGER DEFAULT 0,
    "days_restricted" INTEGER DEFAULT 0,
    "days_transfer" INTEGER DEFAULT 0,
    "client_reported" BOOLEAN,
    "client_report_date" TIMESTAMP(3),
    "railroad_client" "RailroadClient",
    "photos" TEXT[],
    "osha_override_value" BOOLEAN,
    "osha_override_justification" TEXT,
    "osha_override_by_id" UUID,
    "osha_override_at" TIMESTAMP(3),
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "injured_persons" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "employee_id" TEXT,
    "name" TEXT NOT NULL,
    "job_title" TEXT,
    "division" "Division",
    "years_experience" DECIMAL(4,1),
    "injury_type" "InjuryType",
    "body_part" "BodyPart",
    "side" "Side",
    "treatment_type" "TreatmentType",
    "treatment_facility" TEXT,
    "physician" TEXT,
    "returned_to_work" BOOLEAN,
    "return_date" DATE,
    "is_subcontractor" BOOLEAN NOT NULL DEFAULT false,
    "subcontractor_company" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "injured_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "witness_statements" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "witness_name" TEXT NOT NULL,
    "witness_title" TEXT,
    "witness_employer" TEXT,
    "witness_phone" TEXT,
    "statement_date" DATE,
    "statement_text" TEXT NOT NULL,
    "collected_by_id" UUID,

    CONSTRAINT "witness_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigations" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "lead_investigator_id" UUID,
    "investigation_team" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "started_date" DATE,
    "completed_date" DATE,
    "target_completion_date" DATE,
    "status" "InvestigationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "investigation_summary" TEXT,
    "root_cause_method" "RootCauseMethod",
    "root_cause_summary" TEXT,
    "recommendations" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_date" DATE,
    "review_comments" TEXT,
    "review_action" "ReviewAction",

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "five_why_analyses" (
    "id" UUID NOT NULL,
    "investigation_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "evidence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "five_why_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fishbone_factors" (
    "id" UUID NOT NULL,
    "investigation_id" UUID NOT NULL,
    "category" "FishboneCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "is_contributing" BOOLEAN NOT NULL DEFAULT false,
    "evidence" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fishbone_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factor_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FactorCategory" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factor_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributing_factors" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "factor_type_id" UUID NOT NULL,
    "description" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributing_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capas" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "investigation_id" UUID,
    "capa_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "action_type" "ActionType" NOT NULL,
    "category" "CapaCategory" NOT NULL,
    "assigned_to_id" UUID,
    "assigned_date" DATE,
    "due_date" DATE NOT NULL,
    "priority" "CapaPriority" NOT NULL,
    "status" "CapaStatus" NOT NULL DEFAULT 'OPEN',
    "completed_date" DATE,
    "completion_notes" TEXT,
    "completion_evidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verification_method" TEXT,
    "verification_due_date" DATE,
    "verified_by_id" UUID,
    "verified_date" DATE,
    "verification_result" "VerificationResult",
    "verification_notes" TEXT,
    "cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence_links" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "related_incident_id" UUID NOT NULL,
    "similarity_type" "SimilarityType" NOT NULL,
    "detected_by" "DetectedBy" NOT NULL,
    "notes" TEXT,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrence_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "user_id" UUID NOT NULL,
    "incident_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hours_worked" (
    "id" UUID NOT NULL,
    "division" "Division",
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "hours" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hours_worked_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_rules" (
    "id" UUID NOT NULL,
    "railroad_client" "RailroadClient" NOT NULL,
    "incident_type" "IncidentType" NOT NULL,
    "window_minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "incident_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_number_sequences" (
    "year" INTEGER NOT NULL,
    "last_seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "incident_number_sequences_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "capa_number_sequences" (
    "year" INTEGER NOT NULL,
    "last_seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "capa_number_sequences_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_azure_ad_id_key" ON "users"("azure_ad_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_number_key" ON "projects"("project_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_projects_user_id_project_number_key" ON "user_projects"("user_id", "project_number");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incident_number_key" ON "incidents"("incident_number");

-- CreateIndex
CREATE INDEX "idx_incidents_incident_type" ON "incidents"("incident_type");

-- CreateIndex
CREATE INDEX "idx_incidents_status" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "idx_incidents_division" ON "incidents"("division");

-- CreateIndex
CREATE INDEX "idx_incidents_incident_date" ON "incidents"("incident_date");

-- CreateIndex
CREATE INDEX "idx_incidents_severity" ON "incidents"("severity");

-- CreateIndex
CREATE INDEX "idx_incidents_is_osha_recordable" ON "incidents"("is_osha_recordable");

-- CreateIndex
CREATE INDEX "idx_incidents_job_site" ON "incidents"("job_site");

-- CreateIndex
CREATE INDEX "idx_incidents_railroad_client" ON "incidents"("railroad_client");

-- CreateIndex
CREATE INDEX "idx_incidents_reported_by_id" ON "incidents"("reported_by_id");

-- CreateIndex
CREATE INDEX "idx_incidents_project_number" ON "incidents"("project_number");

-- CreateIndex
CREATE INDEX "idx_injured_persons_incident_id" ON "injured_persons"("incident_id");

-- CreateIndex
CREATE INDEX "idx_injured_persons_employee_id" ON "injured_persons"("employee_id");

-- CreateIndex
CREATE INDEX "idx_witness_statements_incident_id" ON "witness_statements"("incident_id");

-- CreateIndex
CREATE UNIQUE INDEX "investigations_incident_id_key" ON "investigations"("incident_id");

-- CreateIndex
CREATE INDEX "idx_investigations_status" ON "investigations"("status");

-- CreateIndex
CREATE INDEX "idx_investigations_lead_investigator_id" ON "investigations"("lead_investigator_id");

-- CreateIndex
CREATE INDEX "idx_investigations_target_completion_date" ON "investigations"("target_completion_date");

-- CreateIndex
CREATE UNIQUE INDEX "five_why_analyses_investigation_id_sequence_key" ON "five_why_analyses"("investigation_id", "sequence");

-- CreateIndex
CREATE INDEX "idx_fishbone_factors_investigation_id" ON "fishbone_factors"("investigation_id");

-- CreateIndex
CREATE INDEX "idx_fishbone_factors_category" ON "fishbone_factors"("category");

-- CreateIndex
CREATE UNIQUE INDEX "factor_types_name_key" ON "factor_types"("name");

-- CreateIndex
CREATE INDEX "idx_factor_types_category" ON "factor_types"("category");

-- CreateIndex
CREATE INDEX "idx_contributing_factors_incident_id" ON "contributing_factors"("incident_id");

-- CreateIndex
CREATE INDEX "idx_contributing_factors_factor_type_id" ON "contributing_factors"("factor_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "capas_capa_number_key" ON "capas"("capa_number");

-- CreateIndex
CREATE INDEX "idx_capas_incident_id" ON "capas"("incident_id");

-- CreateIndex
CREATE INDEX "idx_capas_investigation_id" ON "capas"("investigation_id");

-- CreateIndex
CREATE INDEX "idx_capas_status" ON "capas"("status");

-- CreateIndex
CREATE INDEX "idx_capas_priority" ON "capas"("priority");

-- CreateIndex
CREATE INDEX "idx_capas_due_date" ON "capas"("due_date");

-- CreateIndex
CREATE INDEX "idx_capas_assigned_to_id" ON "capas"("assigned_to_id");

-- CreateIndex
CREATE INDEX "idx_capas_verification_due_date" ON "capas"("verification_due_date");

-- CreateIndex
CREATE INDEX "idx_recurrence_links_incident_id" ON "recurrence_links"("incident_id");

-- CreateIndex
CREATE INDEX "idx_recurrence_links_related_incident_id" ON "recurrence_links"("related_incident_id");

-- CreateIndex
CREATE UNIQUE INDEX "recurrence_links_incident_id_related_incident_id_similarity_key" ON "recurrence_links"("incident_id", "related_incident_id", "similarity_type");

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_incident_id" ON "audit_logs"("incident_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hours_worked_division_year_month_key" ON "hours_worked"("division", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "notification_rules_railroad_client_incident_type_key" ON "notification_rules"("railroad_client", "incident_type");

-- CreateIndex
CREATE INDEX "idx_notifications_user_read" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_project_number_fkey" FOREIGN KEY ("project_number") REFERENCES "projects"("project_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_project_number_fkey" FOREIGN KEY ("project_number") REFERENCES "projects"("project_number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_osha_override_by_id_fkey" FOREIGN KEY ("osha_override_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injured_persons" ADD CONSTRAINT "injured_persons_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "witness_statements" ADD CONSTRAINT "witness_statements_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "witness_statements" ADD CONSTRAINT "witness_statements_collected_by_id_fkey" FOREIGN KEY ("collected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_lead_investigator_id_fkey" FOREIGN KEY ("lead_investigator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "five_why_analyses" ADD CONSTRAINT "five_why_analyses_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fishbone_factors" ADD CONSTRAINT "fishbone_factors_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributing_factors" ADD CONSTRAINT "contributing_factors_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributing_factors" ADD CONSTRAINT "contributing_factors_factor_type_id_fkey" FOREIGN KEY ("factor_type_id") REFERENCES "factor_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capas" ADD CONSTRAINT "capas_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capas" ADD CONSTRAINT "capas_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capas" ADD CONSTRAINT "capas_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capas" ADD CONSTRAINT "capas_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_links" ADD CONSTRAINT "recurrence_links_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_links" ADD CONSTRAINT "recurrence_links_related_incident_id_fkey" FOREIGN KEY ("related_incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
