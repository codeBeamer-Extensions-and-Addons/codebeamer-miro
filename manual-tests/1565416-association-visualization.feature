# Covers the non-automated part of the end to end test of the described functionality

Feature: Visualizing associations between imported Items

    Associations shall be visualized and distinctively.

    Background:
        Given I am a member of the "Toolchains@Temp" Project on Retinatest
        And I have configured the plugin with the "Toolchains@Temp" Project on Retinatest and authenticated myself
        And I am on an empty Miro board
        And I have opened the "Import Items from codeBeamer" modal
        And I have selected "Miro Sync Tests by urecha" as tracker

    Scenario: "<association>" is visualized with "<color>" color
        When I import "<firstItem>" and "<secondItem>" 
        Then the two Items are mapped to Card widgets
        And the cards have a dashed line connecting them
        And the line is colored "<color>"
        And the line is directed towards "<firstItem>"

        Examples: 
        | association | color | firstItem | secondItem |
        | depends on | rot | 1599511 | 1599512 |
        | copy of | türkis | 1599514 | 1599513 |
        | subordinate to | hellgrün | 1599513 | 1599511 |
