# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## Released

### [1.5.2]

-   Add "Estimated effort" as available tag on the generated cards  
    Displays the value of the technical field `estimatedMillis` in hours.

### [1.5.1]

-   Visualized Associations now show their description in place of the generic type name, if they have one

### [1.5.0]

-   Add "Show relations" button in Item Details
    -   Allows visualizing relations between Items on the board:
        -   Downstream References
        -   Associations
-   Refactor Item Detail Action buttons to be icon-only
-   Add tooltips to Item Detail Action buttons
-   Add tooltips (replace title attributes) to Import Page Header buttons

### [1.4.0]

-   Refine "Load Downstream References" button in Item Details
    -   Button now shows the number of Downstream References the Item has
    -   Button is now disabled when the Item has no Downstream References
    -   No longer loads Items, if they're already on the board (doesn't create duplicates)

### [1.3.2]

-   Add preliminary "Load Downstream References" button to Item Details

### [1.3.1]

-   Silenced the "User is locked" error message that would appear whenever one of the plugin's pages is opened.

### [1.3.0]

#### Changed

-   Replaced most Toast-notifications with the now supported miro-notifications  
    These will appear at the bottom of the screen, outside of the modal. In-modal toast notifications are still used in rare occasions.
-   Users will now be prompted to authenticate on Items' Details-Panel if they aren't yet.
-   Refactorings behind the scenes

### [1.2.0]

#### Changed

-   Optimize description rendering in Item Details  
    Links and native codebeamer images (not user-uploaded ones) should now be displayed properly and functionally.
-   Add codeBeamer address & Item id attempted to fetch from in the fatal error message shown on an Item's Details if unable to load  
    This should clarify the fact that the currently set address is used for querying Items.
-   Labels of the editable attributes on the Item Details Panel now use the custom name they have in the respective Tracker
-   Attributes in the "Editable attributes" that can't be edited (don't exist) for this Item are now hidden instead of just disabled.

#### Fixed

-   Fixed a bug where upon opening an Item's details, the description shown on the Miro Card would "revert" to wiki markup.

### [1.1.0]

Version 1.1.0 adds the ability to edit certain attributes of an item in Miro itself and adds various minor fixes / optimizations.

#### Added

-   Item edit panel
    -   Can be opened with the icon on an imported card's top right (might first need to click the "connect" icon before the "open details" one appears - the former currently does nothing, but is a technical constraint)
    -   Shows the item's name along with a button to zoom to it on the board, and its description (readonly)
    -   Shows a select few specific properties, which can be edited if the item('s tracker) has such fields
        Following properties are currently implemented (the names in brackets are the technical field names used to recognize them):
        -   Assignee ("assignedTo")
        -   Team ("teams")
        -   Version ("versions")
        -   Subject ("subjects")
        -   Story Points ("storyPoints")
-   GIFs to the readme for some more functionalities

#### Changed

-   Error handling has been globalized when it comes to failing API calls, which standardizes & abstracts certain error messages.
-   ProjectSelection now selects the currently selected project by default, instead of just mentioning it in the label

#### Fixed

-   Bug where items wouldn't import if they (resp. their tracker) didn't specify a "subjects" field
-   Bug where updating an Item would set its tracker key to "undefined"

### [1.0.0]

Major version 1.0.0 mainly differentiates itself from previous versions by having updated to Miro SDK 2.0, but also by having been rebuilt from the ground up with the framework react.js.

#### Added

-   Project Settings Dialogue to Settings Modal
-   Connection Settings Dialogue to Settings Modal
-   Apply supposed board-wide settings for all users. These include:
    -   CodeBeamer Address
    -   ProjectId
    -   Card Tag configuration
-   Announcements page  
    Page will display to existing users when there are announcements

#### Changed

-   Logo & Name
-   Initial Setup UX
    -   More modular setup dialogues
        -   Seperate authentication dialogue
        -   Seperate project selection dialogue
            -   Project can be filtered and selected by name, instead of having to provide its Id.
    -   Setup is prompted when attempting to open the app with lacking configuration
-   Some UI elements have been restyled, using the Mirotone UI library instead of Bootstrap or custom styles.
-   AND/OR Filter interface adjusted to resemble the UX on codebeamer itself
-   Notifications are currently displayed with bootstrap style (Miro notifications not yet supported in SDK v2).
-   readme documentation; refactored to a minimal feature- & installation overview

#### Removed

-   Plugin widget (auto-generated widget, serving as entrypoint to the settings page)
-   Visualization of associations/relations between Items. (This is not yet supported in SDK v2.)

## [0.12.0]

### Added

-   Filters can be added by pressing "enter" when in the respective input. (No need to always manually click the button.)
-   Import (respectively update-) progress bar now shows when updating/synchronizing items.
-   Preview to how the AppCard on Miro looks in the AppCard-tag Settings
-   "Apply" button in the AppCard-tag Settings to apply changes to currently imported Items

### Changed

-   Loading additional results into the table is no longer triggered with a button, but with scroll-detection. Meaning more results are loaded as you scroll down the table

## [0.11.0]

### Changed

-   Import page
    -   Redesigned Filter Criteria component

## [0.10.0]

### Added

-   Import Page
    -   Filter Criteria can now be chosen from the three standard criteria Team/Release/Subject AND all of a Tracker's fields on top.

## [0.9.11]

### Changed

-   Import Page
    -   No longer displays Items of category "Folder" or "Information".
    -   Also omits such items when mass-importing.

## [0.9.10]

Summarizes minor changes between 0.9.4 and 0.9.10. These versions mainly comprise of technical improvements and bug-fixes.

### Added

-   Import Page now displays a loading screen covering the modal with a progress-bar when importing items.

### Changed

-   Import Page
    -   "Import All" button now works with filters and adnavced search.

## [0.9.4]

### Changed

-   Each property type displayed on a card now has its own color.
-   Summary, Description and Status are displayed with checked boxes in the Import Configuration.
-   Property names in Import Configuration and on cards now have spaces between words.

## [0.9.3]

Technical improvements.

## [0.9.2]

### Added

-   Message is informing the user when all items from a query have been loaded into the table.
-   ImportAll Button displays how many "all" is.

### Changed

-   Button to add filter criteria is now disabled until a Tracker is selected
-   Lazy load button is not shown instead of disabled if there's nothing to load.
-   "Settings" text replaced with an Icon

## [0.9.0]

### Changed

-   Relations between imported items are now visualized more distinctly.
    -   All "associations" are styled as dashed lines, and each one of them has a distinct color.

## [0.8.1]

### Changed

-   Enhances filtering items by allowing to chain several (just the three standard- for now) criteria, linked with AND or OR in a query.
-   Styling of the filter criteria interface

## [0.7.1]

### Added

-   Import page
    -   Import configuration functionality to define default/standard item properties that shall be shown on cards as tags (if they exist on the item).

## [0.6.1]

### Added

-   Import page
    -   Scrolling to the Import page's results-table
    -   Lazy-load button to load more items at the bottom of the Import page's results-table

### Changed

-   Import page results-table styling

### Removed

-   Import page
    -   Results-table pagination controls
    -   The obsolete "Tracker" column from the results-table

## [0.5.1]

### Added

-   Secondary filter criteria input to the Import page
    -   Dropdown to choose whether to filter by Team, Release or Subject
    -   Text-input to then enter the filter value

### Changed

-   Enlarged Modal size to 1080x680 px when opening the Import site.
-   Import site
    -   "Import all" Button placed between "Import" and "Synch" buttons
    -   "Switch to CBQL Input" button placed on the top right
-   readme.md displays changes & additions
