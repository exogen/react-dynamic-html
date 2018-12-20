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

export default class DemoPage extends React.Component {
  state = {
    dynamicTemplate: "<h1>It worked!</h1>"
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
      </main>
    );
  }
}
