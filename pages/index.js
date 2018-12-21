import React from "react";
import Template from "../index";

class StatefulButton extends React.PureComponent {
  state = {
    count: 0
  };

  handleClick = () => {
    this.setState(state => ({ count: state.count + 1 }));
  };

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.props.children} • {this.state.count}
      </button>
    );
  }
}

class NameApp extends React.Component {
  state = {
    name: "Alice"
  };

  toggleName = () => {
    this.setState(state => ({
      name: state.name === "Alice" ? "Bob" : "Alice"
    }));
  };

  render() {
    return (
      <Template
        string={`
          <h1>Hey, {name}!</h1>
          <p>Click here: {button}</p>
        `}
        values={{
          name: this.state.name,
          button: <button onClick={this.toggleName}>Toggle</button>
        }}
      />
    );
  }
}

export default class DemoPage extends React.Component {
  state = {
    dynamicTemplate: "<h1>{title}</h1><p>See: {button}</p>"
  };

  handleChange = event => {
    this.setState({ dynamicTemplate: event.target.value });
  };

  render() {
    const { dynamicTemplate } = this.state;
    return (
      <main>
        <textarea
          rows="10"
          cols="80"
          defaultValue={dynamicTemplate}
          onChange={this.handleChange}
        />
        <Template
          string={dynamicTemplate}
          values={{
            title: "It worked!",
            button: <StatefulButton>Click here!</StatefulButton>,
            otherThing: (
              <Template
                string="Ha! Now click <em>{button}</em>…"
                values={{
                  button: <StatefulButton>here</StatefulButton>
                }}
              />
            )
          }}
        />
        <NameApp />
      </main>
    );
  }
}
