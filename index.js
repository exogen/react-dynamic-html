import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

// Only used server-side to transform HTML into a React component tree.
let parseHTML;

// Only used client-side to target nodes with `querySelectorAll`. We can't just
// use `[data-template-key]` because a Template can render another Template
// inside, and a Template should only find its own placeholder nodes. Only
// Template instances that render placeholders will be assigned an ID and
// increment the counter.
let nextTemplateId = 1;

// Used for all immutable empty objects.
const EMPTY_OBJECT = {};

const escapeChars = {
  "'": "&#39",
  '"': "&quot;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};

function escape(value) {
  return value.replace(/['"&<>]/g, match => escapeChars[match]);
}

export default class Template extends React.PureComponent {
  static propTypes = {
    /**
     * The DOM element type in which to render the entire template.
     */
    as: PropTypes.string,
    /**
     * The DOM element type in which to render React element values by default.
     * To override the tag for individual values, use `valueTags`.
     */
    defaultValueTag: PropTypes.string,
    /**
     * Whether or not to escape values inserted into the HTML.
     */
    escapeValues: PropTypes.bool,
    /**
     * The template HTML string.
     */
    string: PropTypes.string.isRequired,
    /**
     * The string or RegExp that specifies the variable substitution syntax.
     * Each instance will be replaced. The second capture group should be the
     * name of the variable. String values will be passed to RegExp with the
     * `g` flag.
     */
    valuePattern: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * An object mapping variable names (used in the template string) to their
     * values. React element values will be rendered into a placeholder node.
     */
    values: PropTypes.object,
    /**
     * The DOM element type in which to render specific React elements that
     * appear in `values`. Only React elements are wrapped.
     */
    valueTags: PropTypes.objectOf(PropTypes.string)
  };

  /**
   * Resets the template ID counter.
   * Only necessary when you have tests that might care about the generated IDs.
   */
  static reset = () => {
    nextTemplateId = 1;
  };

  static defaultProps = {
    as: "div",
    defaultValueTag: "span",
    escapeValues: true,
    valuePattern: /(\{([$\w]+)\})/g,
    valueTags: EMPTY_OBJECT,
    values: EMPTY_OBJECT
  };

  state = {
    hostNodes: EMPTY_OBJECT
  };

  wrapperRef = React.createRef();
  renderRef = React.createRef();
  hostAttribute = "";

  componentDidMount() {
    if (!process.browser) {
      return;
    }
    const [html, hostElements] = this.renderRef.current;
    this.wrapperRef.current.innerHTML = html;
    this.updateNodes();
  }

  componentDidUpdate() {
    this.updateNodes();
  }

  updateNodes() {
    const { hostNodes } = this.state;
    const [html, hostElements] = this.renderRef.current;
    const nextHostNodes = {};
    let hostsChanged = false;

    if (hostElements.length) {
      this.wrapperRef.current
        .querySelectorAll(`[${this.hostAttribute}]`)
        .forEach(node => {
          const key = node.dataset.templateKey;
          const prevNode = hostNodes[key];
          if (node === prevNode) {
            return;
          } else if (prevNode && prevNode.tagName === node.tagName) {
            node.parentNode.replaceChild(prevNode, node);
            node = prevNode;
          } else {
            hostsChanged = true;
          }
          nextHostNodes[key] = node;
        });
    }

    hostsChanged =
      hostsChanged || Object.keys(hostNodes).length !== hostElements.length;

    if (hostsChanged) {
      this.setState({ hostNodes: nextHostNodes });
    }
  }

  renderTemplate() {
    const {
      string,
      valuePattern,
      values,
      valueTags,
      defaultValueTag,
      escapeValues
    } = this.props;

    const keyMap = process.browser ? {} : EMPTY_OBJECT;
    const hostElements = [];
    const regex =
      typeof valuePattern === "string"
        ? new RegExp(valuePattern, "g")
        : valuePattern;
    const html = string.replace(regex, (match, placeholder, name) => {
      let value = values[name];
      if (typeof value !== "string") {
        if (value == null) {
          return "";
        } else if (Array.isArray(value) || React.isValidElement(value)) {
          const tag = valueTags[name] || defaultValueTag;
          if (!process.browser) {
            hostElements.push(null);
            return `<${tag} data-template-name="${name}"></${tag}>`;
          } else {
            const count = (keyMap[name] = (keyMap[name] || 0) + 1);
            const key = `${name}:${count}`;
            hostElements.push([key, value]);
            if (!this.hostAttribute) {
              this.hostAttribute = `data-template-id="${nextTemplateId++}"`;
            }
            return `<${tag} ${
              this.hostAttribute
            } data-template-key="${key}"></${tag}>`;
          }
        } else {
          value = value.toString();
        }
      }
      return escapeValues ? escape(value) : value;
    });

    if (!process.browser && hostElements.length) {
      if (!parseHTML) {
        parseHTML = require("html-react-parser");
      }
      return [
        parseHTML(html, {
          replace(node) {
            if (node.attribs) {
              const name = node.attribs["data-template-name"];
              if (name) {
                const Host = valueTags[name] || defaultValueTag;
                return <Host>{values[name]}</Host>;
              }
            }
          }
        }),
        // Whelp, don't need these anymore!
        []
      ];
    }

    return [html, hostElements];
  }

  render() {
    // The build process will inline the value of `process.browser` so that any
    // server-only branches will be stripped out via dead code elimination.
    const initialRender = !this.wrapperRef.current;

    const {
      as: Wrapper,
      defaultValueTag,
      escapeValues,
      string,
      valuePattern,
      valueTags,
      values,
      ...wrapperProps
    } = this.props;

    const { hostNodes } = this.state;

    const [html, hostElements] = this.renderTemplate();

    const portals = initialRender
      ? []
      : hostElements.map(([key, value]) => {
          const node = hostNodes[key];
          if (node) {
            // The keyed fragment here is necessary to prevent changes in the
            // order of portals (for example, when a new portal is rendered
            // before another) from causing unmounts. Portals themselves
            // seemingly cannot be keyed.
            return (
              <React.Fragment key={key}>
                {ReactDOM.createPortal(value, node)}
              </React.Fragment>
            );
          }
        });

    if (!process.browser && typeof html !== "string") {
      wrapperProps.children = html;
    } else {
      this.renderRef.current = [html, hostElements];
      wrapperProps.ref = this.wrapperRef;
      wrapperProps.key = "template";
      wrapperProps.suppressHydrationWarning = true;
      wrapperProps.dangerouslySetInnerHTML = { __html: html };
    }

    const wrapper = <Wrapper {...wrapperProps} />;

    return portals.length ? [wrapper, ...portals] : wrapper;
  }
}
