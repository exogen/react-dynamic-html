# react-dynamic-html

Like `dangerouslySetInnerHTML` but with simple old-school template substitution,
where values can be React elements.

Because sometimes you just need to work with HTML from an older system or CMS.

- Tiny 1KB client-side bundle, no dependencies necessary
- Template values can be dynamic React components
- Universal, supports server side rendering (SSR)
- Components get the correct context from above
- Template updates even preserve component state!
- 100% test coverage

## Example

```js
import Template from "react-dynamic-html";

/**
 * This app shows off rendering interactive React components and
 * dynamic values into an HTML string.
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

## API

<!-- AUTO-GENERATED-CONTENT:START (COMPONENTS) -->

### Template

#### Props

<table>
<thead>
<tr>
<th>Name</th>
<th colspan="2">Type</th>
<th>Default</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top" rowspan="1">as</td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1">div</td>
<td valign="top" valign="top" rowspan="1">

The DOM element type in which to render the entire template.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">defaultValueTag</td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1">span</td>
<td valign="top" valign="top" rowspan="1">

The DOM element type in which to render React element values by default.
To override the tag for individual values, use `valueTags`.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">escapeValues</td>
<td valign="top" colspan="2">Boolean</td>
<td valign="top" align="right" rowspan="1">true</td>
<td valign="top" valign="top" rowspan="1">

Whether or not to escape values inserted into the HTML.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">string</strong></td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The template HTML string.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">valuePattern</td>
<td valign="top" colspan="2">
One&nbsp;of… <br>
&nbsp;&nbsp;String <br>
&nbsp;&nbsp;Object
</td>
<td valign="top" align="right" rowspan="1"><pre>/(\{([$\w]+)\})/g</pre></td>
<td valign="top" valign="top" rowspan="1">

The string or RegExp that specifies the variable substitution syntax.
Each instance will be replaced. The second capture group should be the
name of the variable. String values will be passed to RegExp with the
`g` flag.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">values</td>
<td valign="top" colspan="2">Object</td>
<td valign="top" align="right" rowspan="1"><code title="empty object">{}</code></td>
<td valign="top" valign="top" rowspan="1">

An object mapping variable names (used in the template string) to their
values. React element values will be rendered into a placeholder node.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">valueTags</td>
<td valign="top" colspan="2">
Object&nbsp;of… <br>
&nbsp;&nbsp;String
</td>
<td valign="top" align="right" rowspan="1"><code title="empty object">{}</code></td>
<td valign="top" valign="top" rowspan="1">

The DOM element type in which to render specific React elements that
appear in `values`. Only React elements are wrapped.

</td>
</tr>
</tbody>
</table>
<!-- AUTO-GENERATED-CONTENT:END -->

## Motivation

As described in the introduction, sometimes you need to deal with HTML coming
from another system, often controlled by non-technical colleagues. This usually
isn’t a problem (just use `dangerouslySetInnerHTML`) – until they request the
ability to add call-to-action buttons (or other interactive elements) that
ultimately need to call out to your React app. Unless you’re fine with falling
back to vanilla JavaScript for this behavior (i.e. doing `querySelector`,
`addEventListener`, etc. in your lifecycle hooks), now you’ve got a nontrivial
problem on your hands!

Consider the [FormattedMessage](https://github.com/yahoo/react-intl/wiki/Components#formattedmessage)
and [FormattedHTMLMessage](https://github.com/yahoo/react-intl/wiki/Components#formattedhtmlmessage)
components from [react-intl](https://github.com/yahoo/react-intl).
FormattedMessage values can include React elements:

> `<FormattedMessage>` also supports rich-text formatting by passing React
> elements to the `values` prop.

On the other hand, FormattedHTMLMessage comes with a disclaimer:

> … the resulting formatted message will be set via `dangerouslySetInnerHTML`.
> This means that values cannot contain React elements like `<FormattedMessage>`
> and this component will be less performant.

Using this library, you could make FormattedHTMLMessage work with React
elements too!

You might think it’s easy to translate HTML into `React.createElement` calls
in the browser – either by parsing it yourself or injecting it and crawling
the resulting DOM. There are a handful of libraries that already do this, but
it requires a nontrivial amount of code: remember that React requires using
different names for many attributes, and has special handling for others (like
`style`, where you’d have to parse a string of rules into an object). That
approach is both slow and will bloat your bundle size.

## Other Solutions

This library should pretty much be a last resort. Here’s some advice:

**If you can preprocess the HTML** into a simple AST and serve that to your app
instead, do that. Then you can easily translate nodes into `React.createElement`
calls. Everything will be easier and React will be happy. (This library does
exactly that during server-side rendering in order to render with the correct
context, but doing this client-side requires large dependencies.)

**If your HTML authors are technical** and are editing raw HTML, you can avoid
parsing `{placeholders}` and instead come up with some fancy `data-` attributes
to indicate how to transform certain elements into React components (even
allowing them to pass simple props). Then you just need to find and replace
these nodes after mounting. (As above, you’ll still need an HTML parser on the
server.)

**If the HTML comes from a WYSIWYG editor** where special `{placeholder}`
syntax is more accessible, and you just need to stick React components (like
interactive buttons) and text in a few places, use this library.
