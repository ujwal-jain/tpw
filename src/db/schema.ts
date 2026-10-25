import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const programTypeEnum = pgEnum("program_type", [
  "education",
  "vocational",
  "cbt",
  "substance",
  "restorative",
]);

export const riskBandEnum = pgEnum("risk_band", ["low", "med", "high"]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "completed",
  "withdrew",
  "active",
]);

export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  securityLevel: text("security_level").notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: programTypeEnum("type").notNull(),
  annualCostPerParticipantCents: integer("annual_cost_per_participant_cents").notNull(),
});

/**
 * `isComparison` rows are the risk-matched control group: non-participants drawn
 * at the same facility / risk band / age band distribution as enrollees. The
 * recidivism gap is only defensible because this group exists.
 */
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id")
    .notNull()
    .references(() => facilities.id),
  cohortYear: integer("cohort_year").notNull(),
  ageBand: text("age_band").notNull(),
  riskBand: riskBandEnum("risk_band").notNull(),
  isComparison: boolean("is_comparison").notNull().default(false),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id")
    .notNull()
    .references(() => participants.id),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  startedOn: date("started_on").notNull(),
  endedOn: date("ended_on"),
  status: enrollmentStatusEnum("status").notNull(),
  contactHours: integer("contact_hours").notNull(),
  creditDaysEarned: integer("credit_days_earned").notNull().default(0),
});

export const outcomes = pgTable("outcomes", {
  participantId: integer("participant_id")
    .primaryKey()
    .references(() => participants.id),
  releasedOn: date("released_on").notNull(),
  reincarceratedOn: date("reincarcerated_on"),
  recidivated3yr: boolean("recidivated_3yr").notNull(),
  employedAt90d: boolean("employed_at_90d").notNull(),
  wageBand: text("wage_band"),
  rvrCount: integer("rvr_count").notNull().default(0),
  restitutionPaidCents: integer("restitution_paid_cents").notNull().default(0),
});
