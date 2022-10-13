# Covers the non-automated part of the end to end test of the described functionality

@RETINA-1565413
Feature: Configuration of imported item properties

    Imported Items shall (only) display the configured properties (as custom fields).

    Grundlage:
        Given I am a member of the Toolchains Project in Retina
        And I have configured the plugin with the Toolchains Project on Retina and authenticated myself
        And I have opened the "Import Items from codeBeamer" modal
        And I have selected "cALM Features" as Tracker
        And I have opened the "Import Configuration" modal

    # Single property
    Scenario: Selecting "Story Points" as property to import
        When I check only the checkbox for "Story Points"
        And I import the first Item in the results table
        Then a card is created for the respective Item with a custom field showing "Story Points: {storyPoints}"
        And the displayed value corresponds to the Item's "Story Points" value

    # Single property with complex value
    Scenario: Selecting "AssignedTo" as property to import
        When I check only the checkbox for "Assigned To"
        And I import the first Item in the results table
        Then a card is created for the respective Item with a custom field showing "Assigned To: {name[, name]}"
        And the displayed value(s) correspond(s) to the Item's "Assigned To" value(s)

    # Multiple Properties
    Scenario: Selecting "StartDate" and "EndDate" as properties to import
        When I check only the checkboxes for "Start Date" and "End Date"
        And I import the first Item in the results table
        Then a card is created for the respective Item with a custom field showing "Start Date: {startDate}"
        And with a custom fiel showing "End Date: {endDate}"
        And the displayed values correspond to the Item's values for these properties
