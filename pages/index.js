import React from "react";
import styled from "styled-components";
import Template from "../index";

const EditorWrapper = styled.section`
  width: 500px;
  max-width: 100%;
  margin: 50px auto;
  border: 3px solid rgb(75, 0, 170);
  border-radius: 2px 0 0 2px;
  font-family: Lato, sans-serif;
  font-size: 14px;
`;

const Controls = styled.div`
  display: flex;
  align-items: stretch;
`;

const ValuesWrapper = styled.div`
  flex: 0 0 200px;
  background: rgb(75, 0, 170);
  color: white;

  td {
    padding: 0.25em;
    vertical-align: middle;
  }
`;

const ValueName = styled.span`
  margin: 0 0.5em;
  color: rgb(239, 210, 255);
`;

const OutputTemplate = styled(Template)`
  padding: 15px;
`;

const Button = styled.button`
  border: 0;
  border-radius: 2px;
  margin: 2px 10px;
  padding: 5px 10px 6px 10px;
  font-size: 14px;
  line-height: 1;
  background: rgb(189, 34, 244);
  color: white;

  &:first-child {
    margin-left: 0;
  }
`;

const Editor = styled.textarea`
  flex: 1;
  display: block;
  height: 10em;
  border: 0;
  border-bottom: 3px solid rgb(75, 0, 170);
  padding: 0.5em;
  font-size: 14px;
  font-family: Menlo, monospace;
`;

function ValueEditor({ values }) {
  const names = Object.keys(values);
  return (
    <ValuesWrapper>
      <table>
        <tbody>
          {names.map(name => (
            <tr key={name}>
              <td>
                <ValueName>{name}:</ValueName>
              </td>
              <td>{values[name]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ValuesWrapper>
  );
}

class StatefulButton extends React.PureComponent {
  state = {
    count: 0
  };

  handleClick = () => {
    this.setState(state => ({ count: state.count + 1 }));
  };

  render() {
    return (
      <Button onClick={this.handleClick}>
        {this.props.children} • {this.state.count}
      </Button>
    );
  }
}

class EditorDemo extends React.Component {
  state = {
    string: `<h1>{title}</h1>

<p>See: {button}</p>

<p>Numbers: {list}</p>

{nested}
`,
    values: {
      title: "It worked!",
      button: <StatefulButton>Count</StatefulButton>,
      list: [1, 2, 3],
      nested: (
        <Template
          string="ha! {nested}"
          values={{
            nested: <b>gotcha.</b>
          }}
        />
      )
    }
  };

  handleChange = event => {
    this.setState({ string: event.target.value });
  };

  render() {
    const { string, values } = this.state;
    return (
      <EditorWrapper>
        <Controls>
          <Editor value={string} onChange={this.handleChange} />
          <ValueEditor values={values} />
        </Controls>
        <OutputTemplate string={string} values={values} />
      </EditorWrapper>
    );
  }
}

export default class DemoPage extends React.Component {
  render() {
    return (
      <main>
        <EditorDemo />
      </main>
    );
  }
}
