import * as React from "react";
import LoadRelationsButton from "./LoadRelationsButton";

const mockItemId = 201284;

describe("association-visualization", () => {
  context("button", () => {
    it("displays a button to visualize associations", () => {
      cy.mountWithStore(<LoadRelationsButton itemId={mockItemId} />);
      cy.getBySel("show-dependency").should("exist");
    });

    it.only("displays the number of outgoing relations the item has in the button", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelations.json",
      }).as("relations");

      cy.mountWithStore(<LoadRelationsButton itemId={mockItemId} />);
      cy.wait("@relations");

      cy.fixture("itemRelations.json").then((relations) => {
        cy.getBySel("show-dependency").should(
          "contain.text",
          `(${relations.downstreamReferences.length})`
        );
      });
    });

    it("is initially disabled by default", () => {
      cy.mountWithStore(<LoadRelationsButton itemId={mockItemId} />);
      cy.getBySel("show-dependency").should("be.disabled");
    });

    it("is clickable only when there are outgoing relations", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelations.json",
      }).as("relations");
      cy.mountWithStore(<LoadRelationsButton itemId={mockItemId} />);
      cy.wait("@relations");

      cy.stub(miro.board, "get").returns(
        Promise.resolve([
          {
            title:
              '<a href="https://retinatest.roche.com/cb/issue/783345">mock item - [mst|783345]</a>',
            id: "1111",
          },
        ])
      );

      cy.getBySel("show-dependency").should("be.enabled");
    });

    it("prompts the creation of connectors for all outgoing relations of the item", () => {});
  });
});
