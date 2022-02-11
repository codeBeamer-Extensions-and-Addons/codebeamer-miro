# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### [0.9.2]

#### Added
- Message is informing the user when all items from a query have been loaded into the table.
- ImportAll Button displays how many "all" is.

#### Changed
- Button to add filter criteria is now disabled until a Tracker is selected
- Lazy load button is not shown instead of disabled if there's nothing to load.
- "Settings" text replaced with an Icon

### [0.9.0]

#### Changed
- Relations between imported items are now visualized more distinctly.  
  - All "associations" are styled as dashed lines, and each one of them has a distinct color.

### [0.8.1]

#### Changed
- Enhances filtering items by allowing to chain several (just the three standard- for now) criteria, linked with AND or OR in a query.
- Styling of the filter criteria interface

### [0.7.1]

#### Added
- Import page 
  - Import configuration functionality to define default/standard item properties that shall be shown on cards as tags (if they exist on the item).

### [0.6.1]

#### Added
- Import page 
  - Scrolling to the Import page's results-table
  - Lazy-load button to load more items at the bottom of the Import page's results-table

#### Changed
- Import page results-table styling

#### Removed
- Import page
  - Results-table pagination controls
  - The obsolete "Tracker" column from the results-table

### [0.5.1]

#### Added
- Secondary filter criteria input to the Import page
    - Dropdown to choose whether to filter by Team, Release or Subject
    - Text-input to then enter the filter value

#### Changed
- Enlarged Modal size to 1080x680 px when opening the Import site.
- Import site
    - "Import all" Button placed between "Import" and "Synch" buttons
    - "Switch to CBQL Input" button placed on the top right
- readme.md displays changes & additions
