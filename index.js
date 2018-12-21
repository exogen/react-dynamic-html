import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

const emptyValues = {};
const regex = /(\{([$\w]+)\})/g;
const attr = "data-template-key";
let parseHTML;

const isServer = !process.browser;

function defaultRenderer(key, value, tag, getPortal, portals) {
  if (typeof value === "string") {
    return value;
  } else if (value == null) {
    return "";
  } else if (React.isValidElement(value)) {
    portals.push(getPortal(key, value));
    return `<${tag} ${attr}="${key}"></${tag}>`;
  }
  return value.toString();
}

export default class Template extends React.PureComponent {
  static propTypes = {
    as: PropTypes.string,
    renderer: PropTypes.func,
    string: PropTypes.string.isRequired,
    values: PropTypes.objectOf(PropTypes.node),
    valueTags: PropTypes.objectOf(PropTypes.string),
    defaultValueTag: PropTypes.string
  };

  static defaultProps = {
    as: "div",
    renderer: defaultRenderer,
    values: emptyValues,
    valueTags: emptyValues,
    defaultValueTag: "span"
  };

  hostRef = React.createRef();
  cachedHTML = "";

  state = {
    keys: [],
    hosts: {}
  };

  renderTemplate(string, values, valueTags, defaultValueTag) {
    const { hosts } = this.state;
    const portals = [];
    let getKey;
    let getPortal;
    if (isServer) {
      getKey = name => name;
      getPortal = () => null;
    } else {
      const keyMap = new Map();
      getKey = name => {
        const number = (keyMap.get(name) || 0) + 1;
        keyMap.set(name, number);
        return `${name}:${number}`;
      };
      getPortal = (key, value) => {
        const host = hosts[key];
        return host ? ReactDOM.createPortal(value, host) : null;
      };
    }
    let html = string.replace(regex, (match, placeholder, name) => {
      const key = getKey(name);
      const value = values[name];
      const tag = valueTags[name] || defaultValueTag;
      return defaultRenderer(key, value, tag, getPortal, portals);
    });
    if (isServer && portals.length) {
      if (!parseHTML) {
        parseHTML = require("html-react-parser");
      }
      html = parseHTML(html, {
        replace(node) {
          if (node.attribs) {
            const name = node.attribs[attr];
            if (name) {
              const tag = valueTags[name] || defaultValueTag;
              const props = { [attr]: name };
              return React.createElement(tag, props, values[name]);
            }
          }
        }
      });
    }
    return { html, portals };
  }

  collectHosts() {
    const placeholders = this.hostRef.current.querySelectorAll(`[${attr}]`);
    const keys = [];
    const hosts = {};
    placeholders.forEach(node => {
      const key = node.dataset.templateKey;
      keys.push(key);
      hosts[key] = node;
    });
    return { keys, hosts };
  }

  recycleHosts(keys, hosts) {
    const { keys: prevKeys, hosts: prevHosts } = this.state;
    let hostsChanged = keys.length !== prevKeys.length;
    keys.forEach(key => {
      const host = hosts[key];
      const prevHost = prevHosts[key];
      if (host === prevHost) {
        return;
      } else if (prevHost && host.tagName === prevHost.tagName) {
        host.parentNode.replaceChild(prevHost, host);
        hosts[key] = prevHost;
      } else {
        hostsChanged = true;
      }
    });
    return hostsChanged;
  }

  updateHosts(prevState) {
    const { keys, hosts } = this.collectHosts();
    const hostsChanged = prevState ? this.recycleHosts(keys, hosts) : true;
    if (hostsChanged) {
      this.setState({ keys, hosts });
    }
  }

  componentDidMount() {
    if (this.hasPlaceholders) {
      this.hostRef.current.innerHTML = this.cachedHTML;
      this.updateHosts();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.hasPlaceholders || prevState.keys.length) {
      this.updateHosts(prevState);
    }
  }

  render() {
    const {
      string,
      values,
      valueTags,
      defaultValueTag,
      renderer,
      as: Host,
      ...hostProps
    } = this.props;

    const { html, portals } = this.renderTemplate(
      string,
      values,
      valueTags,
      defaultValueTag
    );

    if (isServer && typeof html !== "string") {
      return <Host>{html}</Host>;
    }

    // Save rendered HTML for `componentDidMount`.
    if (!isServer) {
      this.cachedHTML = html;
    }

    // Optimize rendering by skipping work if we know there are no placeholders
    // for injecting React elements.
    this.hasPlaceholders = portals.length > 0;

    // This is necessary because the initial client-side render intentionally
    // ommitted `dangerouslySetInnerHTML`. If it had been included, and this
    // element was hydrated from SSR, then React would either refuse to patch
    // up the mismatched DOM value anyway, or get confused about the contents
    // of the host node. We set this here so that (1) the client-side render
    // shows something right away (even though placeholder elements will be
    // empty), and (2) the `querySelectorAll` call in `collectHosts` finds the
    // placeholders.
    const shouldAvoidMismatch =
      !isServer && !this.hostRef.current && this.hasPlaceholders;

    if (shouldAvoidMismatch) {
      hostProps.suppressHydrationWarning = true;
    } else {
      hostProps.dangerouslySetInnerHTML = { __html: html };
    }

    const host = <Host ref={this.hostRef} {...hostProps} />;

    return this.hasPlaceholders
      ? React.createElement(React.Fragment, {}, host, ...portals)
      : host;
  }
}
