# Covers the non-automated part of the end to end test of the described functionality

Feature: Bulk import

    All Items resulting from a query should be able to be imported with the click of a single button

    Background: 
        Given I am a member of the "Toolchains@Temp" Project on Retinatest
        And I have configured the plugin with the "Toolchains@Temp" Project on Retinatest and authenticated myself
        And I am on an empty Miro board
        And I have opened the "Import Items from codeBeamer" modal

    Scenario: Import all Items resulting from a custom CBQL query
        When I switch to the CBQL input
        And I enter "tracker.id = 3573 AND teamName = 'Edelweiss' AND item.id in (295102,287121,281268)"
        And I click the "Import All" button
        Then the three Items with Ids 295102,287121 and 281268 are imported

    Scenario: Warning when trying to import more than 20 Items at a time
        When I switch to the CBQL input
        And I enter "tracker.id = 3573 AND teamName = 'Edelweiss'"
        And I click the "Import All" button
        Then a warning appears, displaying how many Items would be imported
        And the displayed amount of Items equals the one displayed on the "Import All" button
