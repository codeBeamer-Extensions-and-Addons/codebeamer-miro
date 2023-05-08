import * as React from "react";
import LoadDownstreamReferencesButton from "./loadDownstreamReferencesButton";

const mockItemId = 201284;

describe("load-downstream-refs", () => {
  beforeEach(() => {});

  it("eagerly loads the item its relations", () => {
    cy.intercept(`**/items/${mockItemId}/relations`, {
      fixture: "itemRelations.json",
    }).as("relations");

    cy.mountWithStore(<LoadDownstreamReferencesButton itemId={mockItemId} />);

    cy.wait("@relations");
  });

  describe("button", () => {
    it("displays a button to load downstream references with", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelations.json",
      }).as("relations");

      cy.mountWithStore(<LoadDownstreamReferencesButton itemId={mockItemId} />);
      cy.wait("@relations");

      cy.getBySel("load-downstream-references").should("exist");
    });

    it("displays the number of downstream references the item has in the button", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelations.json",
      }).as("relations");

      cy.mountWithStore(<LoadDownstreamReferencesButton itemId={mockItemId} />);
      cy.wait("@relations");

      cy.getBySel("load-downstream-references").trigger("mouseover");

      cy.fixture("itemRelations.json").then((relations) => {
        cy.getBySel("load-downstream-references-tooltip").should(
          "contain.text",
          `(${relations.downstreamReferences.length})`
        );
      });
    });

    it("disables the button while fetching the relations data", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelations.json",
        delay: 500,
      }).as("relations");

      cy.mountWithStore(<LoadDownstreamReferencesButton itemId={mockItemId} />);

      cy.getBySel("load-downstream-references").should("have.attr", "disabled");
      cy.wait("@relations");
      cy.getBySel("load-downstream-references").should(
        "not.have.attr",
        "disabled"
      );
    });

    it("prompts the Import of all the Item its downstream references when clicked", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelations.json",
        delay: 500,
      }).as("relations");
      cy.intercept(`**/items/query`, {
        fixture: "query_multi-page.json",
      }).as("query");

      cy.mountWithStore(<LoadDownstreamReferencesButton itemId={mockItemId} />);

      cy.wait("@relations");

      cy.getBySel("load-downstream-references").click();
      cy.getBySel("importProgress").should("exist");

      cy.fixture("itemRelations.json").then((relations) => {
        const queryString = `item.id IN (${relations.downstreamReferences.map(
          (d: {
            id: number;
            itemRevision: { id: number; version: number };
            type: string;
          }) => d.itemRevision.id.toString()
        )})`;
        cy.wait("@query")
          .its("request.body.queryString")
          .should("equal", queryString);
      });
    });
  });
});
