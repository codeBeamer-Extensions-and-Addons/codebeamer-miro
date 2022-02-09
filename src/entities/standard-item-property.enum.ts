/**
 * Enumerates the "standard" ~atomic (of type number, text, choice, date, duration and user-reference) properties of any codeBeamer item.
 * In fact, there seems to not be a set-in-stone standard, which all cb items must have in common (but maybe the ID).
 * Therefore, this enumeration only lists the presumably most common properties. To decide what's "most common", only trackers 
 * and Stakeholder-requirements in the Retina (custom codeBeamer) Toolchains project at Roche Diagnostics were considered.
 * 
 * These supposedly standard properties might better be replaced by fully dynamic configurations, with a few of these common properties pre-selected if existing.
 */
export enum StandardItemProperty {
    SUMMARY = "Summary",
    DESCRIPTION = "Description",
    STATUS = "Status",
    ID = "ID",
    TEAMS = "Teams",
    OWNER = "Owner",
    RELEASE = "Release",
    PRIORITY = "Priority",
    STORY_POINTS = "StoryPoints",
    START_DATE = "StartDate",
    END_DATE = "EndDate",
    ASSIGNED_TO = "AssignedTo",
    ASSIGNED_AT = "AssignedAt",
    SUBMITTED_AT = "SubmittedAt",
    SUBMITTED_BY = "SubmittedBy",
    MODIFIED_AT = "ModifiedAt",
    MODIFIED_BY = "ModifiedBy",
}

/**
 * Constant object containing properties, which are named after the StandardItemProperty enum's values and themselves
 * have the values of codeBeamers property names for these labels.
 */
export const codeBeamerPropertyNamesByFieldLabel = {
    Summary: 'name',
    Description: 'description',
    Status: 'status',
    ID: 'id',
    Teams: 'teams',
    Owner: 'supervisor',
    Release: 'release',
    Priority: 'namedPriority',
    StoryPoints: 'storyPoints',
    StartDate: 'startDate',
    EndDate: 'endDate',
    AssignedTo: 'assignedTo',
    AssignedAt: 'assignedAt',
    SubmittedAt: 'submittedAt',
    SubmittedBy: 'submitter',
    ModifiedAt: 'modifiedAt',
    ModifiedBy: 'modifier',
}