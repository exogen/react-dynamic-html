import React from "react";
import { render } from "react-testing-library";
let Template;

function defineTests() {
  afterEach(() => {
    Template.resetTemplateId();
  });

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

  it("renders with the correct context", () => {
    const Context = React.createContext("FAIL");
    const consumer = (
      <Context.Consumer>
        {value => <h1 data-testid="consumer">{value}</h1>}
      </Context.Consumer>
    );
    const { getByTestId } = render(
      <Context.Provider value="PASS">
        <Template string="<div>{consumer}</div>" values={{ consumer }} />
      </Context.Provider>
    );
    expect(getByTestId("consumer")).toHaveTextContent("PASS");
  });

  it("can render values into a different host tag", () => {
    const { container } = render(
      <Template
        string="Hey! {title}"
        values={{ title: <h1>A Good Test</h1> }}
        valueTags={{ title: "header" }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("can supply a default host tag", () => {
    const { container } = render(
      <Template
        string="Hey! {title}"
        values={{ title: <h1>A Good Test</h1> }}
        defaultValueTag="section"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("can render templates inside templates", () => {
    const { container } = render(
      <Template
        string="A: {test}"
        values={{
          test: (
            <Template
              string="B: {test}"
              values={{
                test: (
                  <Template
                    string="C: {test}"
                    values={{ test: <span>OK!</span> }}
                  />
                )
              }}
            />
          )
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
