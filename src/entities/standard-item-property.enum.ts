/**
 * Enumerates the "standard" ~atomic (of type number, text, choice, date, duration and user-reference) properties of any codeBeamer item.
 * In fact, there seems to not be a set-in-stone standard, which all cb items must have in common (but maybe the ID).
 * Therefore, this enumeration only lists the presumably most common properties. To decide what's "most common", only trackers 
 * and Stakeholder-requirements in the Retina (custom codeBeamer) Toolchains project at Roche Diagnostics were considered.
 * 
 * These supposedly standard properties might better be replaced by fully dynamic configurations, with a few of these common properties pre-selected if existing.
 */
export enum StandardItemProperty {
    ID = "ID",
    SUMMARY = "Summary",
    DESCRIPTION = "Description",
    STATUS = "Status",
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

export const codeBeamerPropertyNamesByFieldLabel = {
    ID: 'id',
    Summary: 'name',
    Description: 'description',
    Status: 'status',
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