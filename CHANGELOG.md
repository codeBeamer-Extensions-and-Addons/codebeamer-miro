# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [1.0.0]

#### Added

-   Project Settings Dialogue to Settings Modal
-   Connection Settings Dialogue to Settings Modal
-   Apply supposed board-wide settings for all users. These include:
    -   CodeBeamer Address
    -   ProjectId
    -   Card Tag configuration

#### Changed

-   Logo & Name
-   Initial Setup UX
    -   More modular setup dialogues
        -   Seperate authentication dialogue
        -   Seperate project selection dialogue
    -   Setup is prompted when attempting to open the app with lacking configuration
-   Some UI elements have been restyled, using the Mirotone UI library instead of Bootstrap or custom styles.
-   AND/OR Filter interface adjusted to resemble the UX on codebeamer itself

#### Removed

-   Plugin widget (auto-generated widget, serving as entrypoint to the settings page)
-   Visualization of associations/relations between Items. (This is not yet supported in SDK v2.)

## [0.12.0]

### Added

-   Filters can be added by pressing "enter" when in the respective input. (No need to always manually click the button.)
-   Import (respectively update-) progress bar now shows when updating/synchronizing items.

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
