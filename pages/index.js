import React from "react";
import Head from "next/head";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { FaNpm, FaGithub } from "react-icons/fa/index.mjs";
import Template from "../src";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 30px;
    font-family: 'Lato', sans-serif;
    line-height: 1.5;
    background: rgb(236, 231, 224);
    color: rgb(48, 46, 48);
  }
`;

const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const EditorWrapper = styled.section`
  width: 720px;
  max-width: 100%;
  margin: 50px auto;
  border: 3px solid rgb(75, 0, 170);
  border-radius: 3px;
  font-family: Lato, sans-serif;
  font-size: 14px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (min-width: 700px) {
    flex-direction: row;
  }
`;

const Number = styled.span`
  margin: 0 2px;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
  background: rgb(0, 176, 171);
  color: white;
`;

const ValuesWrapper = styled.div`
  flex: 1 0 auto;
  padding: 0.25em 0.25em 0.5em 0.25em;
  background: rgb(75, 0, 170);
  color: white;

  td {
    padding: 0.25em;
    vertical-align: middle;
  }
`;

const ComponentValue = styled.code`
  font-family: "Dank Mono", Menlo, Monaco, Consolas, monospace;
`;

const ValueName = styled.span`
  margin: 0 0.5em;
  font-size: 13px;
  color: rgb(239, 210, 255);
`;

const OutputTemplate = styled(Template)`
  background: #fff;
  padding: 15px;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }
`;

const Button = styled.button`
  min-width: 7em;
  border: 0;
  border-radius: 2px;
  margin: 0 5px;
  padding: 5px 8px 6px 8px;
  font-size: 13px;
  line-height: 1;
  background: rgb(189, 34, 244);
  color: white;
`;

const Editor = styled.textarea`
  flex: 1 1 50%;
  display: block;
  height: 12em;
  border: 0;
  margin: 0;
  padding: 0.75em;
  background: rgb(255, 251, 236);
  color: rgb(58, 53, 65);
  border-bottom: 3px solid rgb(75, 0, 170);
  box-shadow: inset 2px 3px 5px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-family: "Dank Mono", Menlo, Monaco, Consolas, monospace;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const Arrow = styled.span.attrs(props => ({
  children: "\u00a0→ "
}))`
  margin: 0 0.25em;
  font-size: 16px;
  color: rgb(239, 210, 255);
`;

const GithubIcon = styled(FaGithub)`
  vertical-align: middle;
`;

const NpmIcon = styled(FaNpm)`
  vertical-align: middle;
`;

const Links = styled.ul`
  display: flex;
  list-style: none;
  margin: 0 0 0 30px;
  padding: 0;
  align-items: center;
  justify-content: center;

  > li {
    margin: 0 10px 0 0;
    padding: 0;

    a {
      display: flex;
      align-items: center;
      max-height: 28px;
      color: rgba(75, 0, 170, 0.8);
      overflow: hidden;

      &:hover {
        color: rgb(75, 0, 170);
      }
    }
  }
`;

function ValueEditor({ values }) {
  const names = Object.keys(values);
  return (
    <ValuesWrapper>
      <table>
        <tbody>
          {names.map(name => {
            let value = values[name];
            const isElement = React.isValidElement(value);
            if (isElement) {
              value = (
                <ComponentValue>{`<${value.type.displayName ||
                  value.type.name}>`}</ComponentValue>
              );
            }
            return (
              <tr key={name}>
                <td>
                  <ValueName>{name}:</ValueName>
                </td>
                <td>{value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ValuesWrapper>
  );
}

class StatefulButton extends React.PureComponent {
  static displayName = "StatefulButton";

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

const Title = styled.h1`
  margin: 0 0 0 30px;
  font-size: 24px;
  font-weight: normal;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Tagline = styled.p`
  display: flex;
  flex-direction: column;
  width: 25em;
  max-width: 100%;
  margin: 0 auto;
  font-size: 14px;
  font-family: "Source Sans Pro", sans-serif;
  font-weight: 600;
  font-style: italic;
  letter-spacing: 0.03em;
  word-spacing: 0.08em;
  text-align: center;
  color: rgb(75, 0, 170);
  opacity: 0.8;
`;

const Line = styled.span`
  align-self: ${p => p.align || "flex-start"};
`;

const Quote = styled.span`
  font-size: 3.5em;
  font-weight: normal;
  line-height: 0;
  margin: ${p => (p.type === "open" ? "0 0.1em 0 0" : "0 0.2em 0 0")};
  vertical-align: -0.4em;
  opacity: 0.4;
`;

const sparkle = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.1;
  }
`;

const MagicButton = styled(Button)`
  margin: 20px;
  padding: 10px;
  background: rgb(68, 26, 147);
  box-shadow: 0 0 20px 10px rgba(255, 240, 46, 0.8);

  &:before {
    nimation-name: ${sparkle};
    animation: ${sparkle} 1.3s 0s infinite alternate;
    content: "✨";
  }

  &:after {
    animation: ${sparkle} 1.7s 0.4s infinite alternate;
    content: "✨";
  }
`;

MagicButton.displayName = "MagicButton";

const defaultTemplate = `<h1>{title}</h1>

<p>See: {button}</p>

<p>Numbers: {array}</p>

{nestedTemplate}
`;

class EditorDemo extends React.Component {
  handleMagicReset = () => {
    const chars = Array.from(defaultTemplate);
    let index = 0;
    const typeNextChar = () => {
      if (index < chars.length) {
        const string = chars.slice(0, index).join("");
        this.setState({ string });
        index += 1;
        this.magicTimer = setTimeout(typeNextChar, 60);
      }
    };
    typeNextChar();
  };

  state = {
    string: defaultTemplate,
    values: {
      title: "It worked!",
      button: <StatefulButton>Count</StatefulButton>,
      array: [1, 2, 3].map(number => <Number key={number}>{number}</Number>),
      nestedTemplate: (
        <Template
          string="Another one? {answer}"
          values={{
            answer: <strong>Neato.</strong>
          }}
        />
      ),
      magic: (
        <MagicButton onClick={this.handleMagicReset}>Magical Reset</MagicButton>
      )
    }
  };

  componentWillUnmount() {
    clearTimeout(this.magicTimer);
  }

  handleChange = event => {
    this.setState({ string: event.target.value });
  };

  render() {
    const { string, values } = this.state;
    return (
      <EditorWrapper>
        <Controls>
          <Editor value={string} onChange={this.handleChange} />
          <ValueEditor
            values={values}
            valueTags={{ nestedTemplate: "section" }}
          />
        </Controls>
        <OutputTemplate string={string} values={values} />
      </EditorWrapper>
    );
  }
}

export default class DemoPage extends React.Component {
  render() {
    return (
      <section>
        <Head>
          <title>react-dynamic-html</title>
        </Head>
        <GlobalStyle />
        <header>
          <Top>
            <Title>
              <a href="https://github.com/exogen/react-dynamic-html">
                react-dynamic-html
              </a>
            </Title>
            <Links>
              <li>
                <a href="https://github.com/exogen/react-dynamic-html">
                  <GithubIcon size={24} />
                </a>
              </li>
              <li>
                <a href="https://www.npmjs.com/package/react-dynamic-html">
                  <NpmIcon size={40} />
                </a>
              </li>
            </Links>
          </Top>
          <Tagline>
            <Line>
              <Quote type="open">“</Quote>It’s like dangerouslySetInnerHTML
            </Line>
            <Line align="flex-end">
              but you can stick React components in there
              <Quote type="close">”</Quote>
            </Line>
          </Tagline>
        </header>
        <main>
          <EditorDemo />
        </main>
      </section>
    );
  }
}
