import React from "react";
import { render } from "react-testing-library";
let Template;

function defineTests() {
  it("renders the given string into a div", () => {
    const { container } = render(<Template string="Hi there!" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the given string into the supplied DOM element type", () => {
    const { container } = render(<Template string="Hi there!" as="span" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("passes props to the rendered element", () => {
    const { container } = render(
      <Template className="StyledTemplate" string="Hi there!" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders placeholders", () => {
    const { container } = render(
      <Template
        string="<h1>Chapter 1: {title}</h1>"
        values={{
          title: "A Good Test"
        }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders React placeholders", () => {
    const { container } = render(
      <Template
        string="<h1>Chapter 1: {title}</h1>"
        values={{
          title: (
            <React.Fragment>
              A <em>Better</em> Test
            </React.Fragment>
          )
        }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders value updates", () => {
    const { container, rerender } = render(
      <Template
        string="Hey! {title}"
        values={{
          title: <h1>A Good Test</h1>
        }}
      />
    );
    rerender(
      <Template string="Hey! {title}" values={{ title: <h2>A Bad Test</h2> }} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders template updates", () => {
    const { container, rerender } = render(
      <Template
        string="Hey! {title}"
        values={{
          title: <h1>A Good Test</h1>
        }}
      />
    );
    rerender(
      <Template
        string="Hey! {title} …and again… {title}"
        values={{
          title: <h1>A Good Test</h1>
        }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders numbers, undefined, null, and objects", () => {
    const { container } = render(
      <Template
        string="Types: {number}, {undefined}, {null}, {object}"
        values={{
          number: 0,
          null: null,
          object: [1, 2, 3]
        }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
}

describe("Template", () => {
  describe("server", () => {
    beforeAll(() => {
      jest.resetModules();
      process.browser = false;
      Template = require("./index").default;
    });

    defineTests();
  });

  describe("browser", () => {
    beforeAll(() => {
      jest.resetModules();
      process.browser = true;
      Template = require("./index").default;
    });

    defineTests();
  });
});
