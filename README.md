# react-dynamic-html

Like `dangerouslySetInnerHTML` but with simple old-school template substitution,
where values can be React components.

Because sometimes you just need to work with HTML from an older system or CMS.

- Tiny client-side bundle, no dependencies necessary
- Template values can be dynamic React components
- Universal, supports server side rendering (SSR)
- Components get the correct context from above
- Template updates preserve component state

## Usage

```js
import Template from "react-dynamic-html";

/**
 * This app shows off rendering interactive React components and dynamic values
 * into an HTML string.
 */
class App extends React.Component {
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
```

## Other Solutions

This package should pretty much be a last resort. Here’s some advice:

**If you can preprocess the HTML** into a simple AST and serve that to your app
instead, do that. Then you can easily translate nodes into `React.createElement`
calls. Everything will be easier and React will be happy.

**If your HTML authors are technical** and not using a WYSIWYG editor, you
can come up with some fancy `data-` attributes to indicate what elements to
transform into React components, and even allow them to specify primitive props.
Then you just need to find and replace these nodes after mounting. (But on the
server you’ll need an HTML parser.)

**If the HTML comes from a WYSIWYG editor** and you just need to stick React
components (like interactive buttons) and text in a few places, use this
library.
