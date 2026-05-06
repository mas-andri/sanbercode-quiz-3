/// <reference types="cypress" />

describe("Platzi Fake Store - Categories", () => {
  let api;

  before(() => {
    cy.fixture("platzi").then((data) => {
      api = data;
    });
  });

  it("TC-01 - Get all categories", () => {
    cy.request({
      method: "GET",
      url: `${api.baseUrl}${api.endpoints.categories}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array").and.have.length.greaterThan(0);

      // Schema validation
      response.body.forEach((category, index) => {
        api.schema.requiredFields.forEach((field) => {
          expect(
            category,
            `Item [${index}] missing field: ${field}`,
          ).to.have.property(field);
        });
      });
    });
  });

  it("TC-02 - Get all categories response items have correct data types", () => {
    cy.request("GET", `${api.baseUrl}${api.endpoints.categories}`).then(
      (response) => {
        expect(response.status).to.equal(200);

        const category = response.body[0];

        expect(category.id).to.be.a("number");
        expect(category.name).to.be.a("string").and.not.be.empty;
        expect(category.slug).to.be.a("string").and.not.be.empty;
        expect(category.image).to.be.a("string").and.not.be.empty;
        expect(new Date(category.creationAt).toString()).to.not.equal(
          "Invalid Date",
        );
        expect(new Date(category.updatedAt).toString()).to.not.equal(
          "Invalid Date",
        );
      },
    );
  });

  it("TC-03 - Get category by id", () => {
    const { id, name, slug } = api.existingCategory;

    cy.request({
      method: "GET",
      url: `${api.baseUrl}${api.endpoints.categories}/${id}`,
    }).then((response) => {
      expect(response.status).to.equal(200);

      const body = response.body;

      expect(body.id).to.equal(id);
      expect(body.name).to.equal(name);
      expect(body.slug).to.equal(slug);

      api.schema.requiredFields.forEach((field) => {
        expect(body).to.have.property(field);
      });
    });
  });

  it("TC-04 - Get a single category by slug", () => {
    const { slug } = api.existingCategory;

    cy.request({
      method: "GET",
      url: `${api.baseUrl}/categories/slug/${slug}`,
    }).then((response) => {
      expect(response.status).to.equal(200);

      const body = response.body;

      expect(body.slug).to.equal(slug);
      expect(body.id).to.be.a("number");
      expect(body.name).to.be.a("string").and.not.be.empty;
    });
  });

  it("TC-05 - returns an error for a non-existent slug", () => {
    cy.request({
      method: "GET",
      url: `${api.baseUrl}/categories/slug/this-slug-does-not-exist-xyz123`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC-06 - Create a category", () => {
    const uniqueName = `${api.newCategory.name} ${Date.now()}`;
    const payload = {
      name: uniqueName,
      image: api.newCategory.image,
    };

    cy.request({
      method: "POST",
      url: `${api.baseUrl}${api.endpoints.categories}`,
      body: payload,
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      expect(response.status).to.equal(201);

      const body = response.body;

      expect(body.name).to.equal(uniqueName);
      expect(body.slug).to.be.a("string").and.not.be.empty;
      expect(body.id).to.be.a("number").and.be.greaterThan(0);

      api.schema.requiredFields.forEach((field) => {
        expect(
          body,
          `Created category missing field: ${field}`,
        ).to.have.property(field);
      });
    });
  });

  it("TC-07 - returns 400 when 'image' is missing", () => {
    cy.request({
      method: "POST",
      url: `${api.baseUrl}${api.endpoints.categories}`,
      body: {
        name: "Category Without Image",
      },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC-08 - Update a category", () => {
    const originalName = `QA Update Target ${Date.now()}`;
    const updatedName = `${api.updatedCategory.name} ${Date.now()}`;

    cy.request({
      method: "POST",
      url: `${api.baseUrl}${api.endpoints.categories}`,
      body: { name: originalName, image: api.newCategory.image },
      headers: { "Content-Type": "application/json" },
    }).then((createResponse) => {
      expect(createResponse.status).to.equal(201);
      const createdId = createResponse.body.id;

      cy.request({
        method: "PUT",
        url: `${api.baseUrl}${api.endpoints.categories}/${createdId}`,
        body: {
          name: updatedName,
          image: api.updatedCategory.image,
        },
        headers: { "Content-Type": "application/json" },
      }).then((updateResponse) => {
        expect(updateResponse.status).to.equal(200);

        const body = updateResponse.body;

        expect(body.id).to.equal(createdId);
        expect(body.name).to.equal(updatedName);
        expect(body.slug).to.include("sanbercode-cypress-api-test-update");
      });
    });
  });

  it("TC-09 - returns an error for a non-existent ID", () => {
    cy.request({
      method: "PUT",
      url: `${api.baseUrl}${api.endpoints.categories}/${api.invalidId}`,
      body: api.updatedCategory,
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("TC-10 - Delete a category", () => {
    const category = api.newCategory;

    cy.request({
      method: "POST",
      url: `${api.baseUrl}${api.endpoints.categories}`,
      body: { name: `${category.name} ${Date.now()}`, image: category.image },
      headers: { "Content-Type": "application/json" },
    }).then((createResponse) => {
      expect(createResponse.status).to.equal(201);

      const deletableId = createResponse.body.id;

      cy.request({
        method: "DELETE",
        url: `${api.baseUrl}${api.endpoints.categories}/${deletableId}`,
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.equal(200);

        cy.request({
          method: "GET",
          url: `${api.baseUrl}${api.endpoints.categories}/${deletableId}`,
          failOnStatusCode: false,
        }).then((getResponse) => {
          expect(getResponse.status).to.be.oneOf([400, 404]);
        });
      });
    });
  });

  it("TC-11 - Get all products by category", () => {
    const { id: categoryId } = api.existingCategory;

    cy.request({
      method: "GET",
      url: `${api.baseUrl}${api.endpoints.categories}/${categoryId}/products`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");

      if (response.body.length > 0) {
        const product = response.body[0];

        expect(product).to.have.all.keys(
          "id",
          "title",
          "slug",
          "price",
          "description",
          "category",
          "images",
          "creationAt",
          "updatedAt",
        );

        expect(product.id).to.be.a("number");
        expect(product.title).to.be.a("string").and.not.be.empty;
        expect(product.price).to.be.a("number").and.be.greaterThan(0);
        expect(product.images).to.be.an("array").and.have.length.greaterThan(0);

        const nestedCategory = product.category;

        expect(nestedCategory).to.be.an("object");
        expect(nestedCategory).to.have.all.keys(
          "id",
          "name",
          "slug",
          "image",
          "creationAt",
          "updatedAt",
        );
        expect(nestedCategory.id).to.be.a("number");
        expect(nestedCategory.name).to.be.a("string").and.not.be.empty;
      }
    });
  });

  it("TC-12 - GET /categories responds within 5000 ms", () => {
    cy.request({
      method: "GET",
      url: `${api.baseUrl}${api.endpoints.categories}`,
    }).then((response) => {
      expect(response.status).to.equal(200);

      expect(
        response.duration,
        `Response time ${response.duration}ms exceeded 5000ms SLA`,
      ).to.be.lessThan(5000);
    });
  });
});
