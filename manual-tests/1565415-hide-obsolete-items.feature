# Covers the non-automated part of the end to end test of the described functionality

@RETINA-1565415
Feature: Items of type "Folder" and "Information" aren't imported

    Background:
        Given I am a member of the Toolchains Project in Retina
        And I have configured the plugin with the Toolchains Project on Retina and authenticated myself
        And I have opened the "Import Items from codeBeamer" modal

    Scenario: Bulk-importing a query that contains Items of type "Folder"
        When I switch to the CBQL Input
        And I enter the query "tracker.id = 3572 AND item.id in (206424,230864,71802)"
        And I click the "Import All" button
        Then only the Item with Id 71802 is imported
