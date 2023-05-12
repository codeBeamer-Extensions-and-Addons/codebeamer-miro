import * as React from "react";
import LoadRelationsButton from "./loadRelationsButton";

const mockItemId = 201284;

describe("association-visualization", () => {
  context("button", () => {
    it("displays a button to visualize associations", () => {
      cy.mountWithStore(
        <LoadRelationsButton itemId={mockItemId} cardId={""} />
      );
      cy.getBySel("show-dependency").should("exist");
    });

    it("displays the number of outgoing relations the item has in the button", () => {
      //  the test data is prepared such that the displayed amount should be 2
      const expectedAmount = 2;
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelationsForRelationsButton.json",
      }).as("relations");

      cy.stub(miro.board, "get").as("boardGet").resolves(boardData);

      cy.mountWithStore(
        <LoadRelationsButton itemId={mockItemId} cardId={""} />
      );

      cy.wait("@relations");

      cy.getBySel("show-dependency").trigger("mouseover");

      cy.getBySel("show-dependency-tooltip").should(
        "contain.text",
        `(${expectedAmount})`
      );
    });

    it("is initially disabled by default", () => {
      cy.mountWithStore(
        <LoadRelationsButton itemId={mockItemId} cardId={""} />
      );
      cy.getBySel("show-dependency").should("be.disabled");
    });

    it("is clickable only when there are outgoing relations", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelationsForRelationsButton.json",
      }).as("relations");

      cy.stub(miro.board, "get").as("boardGet").resolves(boardData);

      cy.mountWithStore(
        <LoadRelationsButton itemId={mockItemId} cardId={""} />
      );

      cy.wait("@relations");

      cy.getBySel("show-dependency").should("be.enabled");
    });

    it("prompts the creation of connectors for all outgoing relations of the item", () => {
      cy.intercept(`**/items/${mockItemId}/relations`, {
        fixture: "itemRelationsForRelationsButton.json",
      }).as("relations");

      cy.stub(miro.board, "get").as("boardGet").resolves(boardData);

      cy.mountWithStore(
        <LoadRelationsButton itemId={mockItemId} cardId={""} />
      );

      cy.wait("@relations");

      cy.getBySel("show-dependency").click();

      cy.getBySel("show-dependency-tooltip").should("contain.text", "Hide");
    });
  });
});

const boardData = [
  {
    type: "app_card",
    owned: false,
    title:
      '<a href="https://retinatest.roche.com/cb/issue/1599512">AssociatinoTest - I count on you - [mst|1599512]</a>',
    description: "I count on you",
    style: {
      cardTheme: "#27c27c",
    },
    tagIds: [],
    status: "connected",
    fields: [
      {
        value: "ID: 1599512",
        fillColor: "#bf4040",
        textColor: "#ffffff",
      },
      {
        value: "Status: New",
        fillColor: "#4f8ae8",
        textColor: "#ffffff",
      },
    ],
    id: "3458764548228684168",
    parentId: null,
    origin: "center",
    createdAt: "2023-03-08T09:21:27.070Z",
    createdBy: "3074457363355490965",
    modifiedAt: "2023-03-17T09:17:48.037Z",
    modifiedBy: "3074457363355490965",
    x: -975.23218912019,
    y: 1787.70136222127,
    width: 320,
    height: 114,
    rotation: 0,
    getMetadata: async function () {
      return {
        item: { id: 1599512 },
      };
    },
  },
  {
    type: "app_card",
    owned: false,
    title:
      '<a href="https://retinatest.roche.com/cb/issue/1599511">AssociationTest - count on me - [mst|1599511]</a>',
    description: "You can count on me.",
    style: {
      cardTheme: "#27c27c",
    },
    tagIds: [],
    status: "connected",
    fields: [
      {
        value: "ID: 1599511",
        fillColor: "#bf4040",
        textColor: "#ffffff",
      },
      {
        value: "Status: New",
        fillColor: "#4f8ae8",
        textColor: "#ffffff",
      },
    ],
    id: "3458764548228684170",
    parentId: null,
    origin: "center",
    createdAt: "2023-03-08T09:21:27.230Z",
    createdBy: "3074457363355490965",
    modifiedAt: "2023-03-17T09:17:48.037Z",
    modifiedBy: "3074457363355490965",
    x: -442.128446533173,
    y: 1787.70136222127,
    width: 320,
    height: 114,
    rotation: 0,
    getMetadata: async function () {
      return {
        item: { id: 1599511 },
      };
    },
  },
  {
    type: "app_card",
    owned: false,
    title:
      '<a href="https://retinatest.roche.com/cb/issue/1599514">Copy of the supreme superordinate - [mst|1599514]</a>',
    description:
      "Category: --Priority: --Severity: --Status: NewRelease: --Subject: Platform: <br />I am the supreme superordinate, master of all subordinates.\nHey na\n<p><i>sup</i> <b>dude</b></p>",
    style: {
      cardTheme: "#27c27c",
    },
    tagIds: [],
    status: "connected",
    fields: [
      {
        value: "ID: 1599514",
        fillColor: "#bf4040",
        textColor: "#ffffff",
      },
      {
        value: "Owner: training-user-10",
        fillColor: "#4095bf",
        textColor: "#ffffff",
      },
      {
        value: "Status: New",
        fillColor: "#4f8ae8",
        textColor: "#ffffff",
      },
    ],
    id: "3458764548820942776",
    parentId: null,
    origin: "center",
    createdAt: "2023-03-14T16:28:10.611Z",
    createdBy: "3074457363355490965",
    modifiedAt: "2023-03-17T09:17:48.037Z",
    modifiedBy: "3074457363355490965",
    x: -975.23218912019,
    y: 1555.99975797744,
    width: 320,
    height: 146,
    rotation: 0,
    getMetadata: async function () {
      return {
        item: { id: 1599514 },
      };
    },
  },
  {
    type: "app_card",
    owned: false,
    title:
      '<a href="https://retinatest.roche.com/cb/issue/1599513">Supreme Superordinate - [mst|1599513]</a>',
    description: "I am the supreme superordinate, master of all subordinates.",
    style: {
      cardTheme: "#27c27c",
    },
    tagIds: [],
    status: "connected",
    fields: [
      {
        value: "ID: 1599513",
        fillColor: "#bf4040",
        textColor: "#ffffff",
      },
      {
        value: "Status: New",
        fillColor: "#4f8ae8",
        textColor: "#ffffff",
      },
    ],
    id: "3458764548820942779",
    parentId: null,
    origin: "center",
    createdAt: "2023-03-14T16:28:10.784Z",
    createdBy: "3074457363355490965",
    modifiedAt: "2023-03-17T09:21:13.217Z",
    modifiedBy: "3074457363355490965",
    x: -442.128446533173,
    y: 1555.99975797744,
    width: 320,
    height: 114,
    rotation: 0,
    getMetadata: async function () {
      return {
        item: { id: 1599513 },
      };
    },
  },
  {
    type: "connector",
    shape: "curved",
    start: {
      item: "1",
      snapTo: "auto",
    },
    end: {
      item: "2",
      snapTo: "auto",
    },
    style: {
      startStrokeCap: "none",
      endStrokeCap: "stealth",
      strokeStyle: "normal",
      strokeWidth: 1,
      strokeColor: "#008c00",
      fontSize: 14,
      color: "#1a1a1a",
      textOrientation: "aligned",
    },
    captions: [
      {
        content: "parent",
        position: 0.5,
        textAlignVertical: "middle",
      },
    ],
    id: "3",
    parentId: null,
    origin: "center",
    createdAt: "2023-03-17T09:36:36.687Z",
    createdBy: "3074457363355490965",
    modifiedAt: "2023-03-17T09:36:38.605Z",
    modifiedBy: "3074457363355490965",
    getMetadata: async function () {
      return {
        startCardId: 1,
        endCardId: 2,
      };
    },
  },
];
