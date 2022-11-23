# ItemDetails Component

## Adding a new field to be editable

Follow these steps to add a new editable attribute to the component

1. Add a respective entry in [edtiable-attributes.ts](/src/constants/editable-attributes.ts)
    - You should specify a constant for the FIELD (REST API v3)- and LEGACY (REST API v1) names of the item. You can find these values in a call to `/api/v3/trackers/{trackerId}/schema` for your sample tracker.  
      Although the schema is specific to a tracker, we're hoping/assuming that these names are shared - respectively we aim to add only such fields that are commonly used in many trackers, as long as we're not providing a fully dynamic solution.
    - You must specify the attribute in the `EDITABLE_ATTRIBUTES` array, which will be looped over in certain places.
2. Add the input for the attribute
    1. Add the field to the formik form helper, analogously to the other fields.
        1. Add a field and initial value to the `initialValues`
        2. Add it in the `payload` in the `onSubmit` handler
    - If the field is a _ChoiceField_ field, add a `<Select />`
        1. Copy the code of for example the `ASSIGNEE` select and put it where you want it
        2. Replace essentially all `ASSIGNEE_FIELD_NAME` or hardcoded labels by the respective field's values.
    - If the field is a text input, add an `<input />`
        1. Copy the code of for example the `STORY POINTS` input and put it where you want.
        2. Replace essentially all `STORY_POINTS_FIELD_NAME` or hardcoded labels by the respective field's values
