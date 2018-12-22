import React from "react";
import { render, fireEvent, wait } from "react-testing-library";
import Template from "./index";
import HooksTemplate from "./index.hooks";

class StatefulButton extends React.Component {
  state = { counter: 0 };

  render() {
    return (
      <button
        {...this.props}
        onClick={() =>
          this.setState(state => ({
            counter: state.counter + 1
          }))
        }
      >
        {this.state.counter}
      </button>
    );
  }
}

describe("Template", () => {
  describe("class", () => {
    describe("server-side", () => {
      defineTests(Template, true);
    });

    describe("client-side", () => {
      defineTests(Template, false);
    });
  });

  describe("using hooks", () => {
    describe("server-side", () => {
      defineTests(HooksTemplate, true);
    });

    describe("client-side", () => {
      defineTests(HooksTemplate, false);
    });
  });
});

function defineTests(Template, isServer) {
  beforeAll(() => {
    process.browser = !isServer;
  });

  beforeEach(() => {
    Template.reset();
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

  it("renders numbers, undefined, null, arrays, and objects", () => {
    const { container } = render(
      <Template
        string="Types: {number}, {undefined}, {null}, {array}, {object}"
        values={{
          number: 0,
          null: null,
          array: [1, 2, 3],
          object: { toString: () => "[object Hello]" }
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

  it("supports string value patterns", () => {
    const { container } = render(
      <Template
        string="Hey! <% title %>"
        valuePattern="(<% *(\w+) *%>)"
        values={{ title: <h1>It worked!</h1> }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("escapes values by default", () => {
    const { container } = render(
      <Template
        string="{title}"
        values={{ title: "<script>alert(0)</span>" }}
      />
    );
    expect(container.firstChild.innerHTML).toBe(
      "&lt;script&gt;alert(0)&lt;/span&gt;"
    );
  });

  it("can disable escaping", () => {
    const { container } = render(
      <Template
        string="{title}"
        values={{ title: "<script>alert(0)</script>" }}
        escapeValues={false}
      />
    );
    expect(container.firstChild.innerHTML).toBe("<script>alert(0)</script>");
  });

  if (!isServer) {
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
        <Template
          string="Hey! {title}"
          values={{ title: <h2>A Bad Test</h2> }}
        />
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

    it("does not unmount moved portals", () => {
      const values = {
        title: <h1>Counter</h1>,
        button: <StatefulButton data-testid="button" />
      };

      const { container, getByTestId, rerender } = render(
        <Template string="<div>{title} {button}</div>" values={values} />
      );

      const button = getByTestId("button");
      expect(button).toHaveTextContent("0");
      fireEvent.click(button);
      expect(button).toHaveTextContent("1");
      fireEvent.click(button);
      expect(button).toHaveTextContent("2");

      rerender(<Template string="<div>{button}</div>" values={values} />);

      const newButton = getByTestId("button");
      expect(newButton).toBe(button);
      expect(newButton).toHaveTextContent("2");
      expect(container.firstChild).toMatchSnapshot();
    });
  }
}
