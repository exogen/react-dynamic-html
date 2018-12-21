import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

// Only used server-side to transform HTML into a React component tree.
let parseHTML;

// Only used client-side to target nodes to find with `querySelectorAll`. We
// can't just use `[data-template-key]` because a Template can render another
// Template inside. A Template should only find its own placeholder nodes. Only
// Template instances that render placeholders will be assigned an ID and
// increment the counter.
let nextTemplateId = 1;

// The build process will inline the value of `process.browser` so that any
// server-only branches will be stripped out.
const isServer = !process.browser;

const EMPTY_OBJECT = {};

export default class Template extends React.PureComponent {
  static propTypes = {
    as: PropTypes.string,
    defaultValueTag: PropTypes.string,
    string: PropTypes.string.isRequired,
    valuePattern: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    values: PropTypes.object,
    valueTags: PropTypes.objectOf(PropTypes.string)
  };

  static defaultProps = {
    as: "div",
    defaultValueTag: "span",
    valuePattern: /(\{([$\w]+)\})/g,
    values: EMPTY_OBJECT,
    valueTags: EMPTY_OBJECT
  };

  static resetTemplateId() {
    nextTemplateId = 1;
  }

  hostRef = React.createRef();
  cachedHTML = "";
  hostSelector = "";

  state = {
    keys: [],
    hosts: EMPTY_OBJECT
  };

  collectHosts() {
    const placeholders = this.hostRef.current.querySelectorAll(
      `[${this.hostSelector}]`
    );
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

  renderValue(name, value, tag, getKey, createPortal) {
    if (typeof value === "string") {
      return value;
    } else if (value == null) {
      return "";
    } else if (React.isValidElement(value)) {
      const key = getKey(name);
      createPortal(key, value);
      let id = "";
      if (!isServer) {
        if (!this.hostSelector) {
          this.hostSelector = `data-template-id="${nextTemplateId++}"`;
        }
        id = ` ${this.hostSelector}`;
      }
      return `<${tag}${id} data-template-key="${key}"></${tag}>`;
    }
    return value.toString();
  }

  renderTemplate(string, valuePattern, values, valueTags, defaultValueTag) {
    const { hosts } = this.state;
    const portals = [];
    let getKey;
    let createPortal;
    if (isServer) {
      getKey = name => name;
      createPortal = () => {
        portals.push(null);
      };
    } else {
      const keyMap = new Map();
      getKey = name => {
        const number = (keyMap.get(name) || 0) + 1;
        keyMap.set(name, number);
        return `${name}:${number}`;
      };
      createPortal = (key, value) => {
        const host = hosts[key];
        portals.push(host ? ReactDOM.createPortal(value, host) : null);
      };
    }
    let html = string.replace(valuePattern, (match, placeholder, name) => {
      const value = values[name];
      const tag = valueTags[name] || defaultValueTag;
      return this.renderValue(name, value, tag, getKey, createPortal);
    });
    if (isServer && portals.length) {
      if (!parseHTML) {
        parseHTML = require("html-react-parser");
      }
      html = parseHTML(html, {
        replace(node) {
          if (node.attribs) {
            const name = node.attribs["data-template-key"];
            if (name) {
              const tag = valueTags[name] || defaultValueTag;
              return React.createElement(tag, EMPTY_OBJECT, values[name]);
            }
          }
        }
      });
    }
    return { html, portals };
  }

  render() {
    const {
      as: Host,
      string,
      valuePattern,
      values,
      valueTags,
      defaultValueTag,
      ...hostProps
    } = this.props;

    const { html, portals } = this.renderTemplate(
      string,
      valuePattern,
      values,
      valueTags,
      defaultValueTag
    );

    if (isServer) {
      if (typeof html === "string") {
        hostProps.dangerouslySetInnerHTML = { __html: html };
      } else {
        hostProps.children = html;
      }
      return React.createElement(Host, hostProps);
    }

    // Optimize rendering by skipping work if we know there are no placeholder
    // elements (for rendering React components).
    this.hasPlaceholders = portals.length > 0;
    // This is necessary because if there are placeholders and this element is
    // being hydrated from SSR, the initial render will fail to use
    // `dangerouslySetInnerHTML`. React will either refuse to patch up the
    // mismatched DOM or get confused about the contents of the node. We set
    // this here so that we can set `innerHTML` ourselves in
    // `componentDidMount` in order to (1) show the correct content and (2)
    // succeed at finding placeholders with `querySelectorAll`.
    this.cachedHTML = html;

    hostProps.ref = this.hostRef;
    hostProps.dangerouslySetInnerHTML = { __html: html };
    hostProps.suppressHydrationWarning = true;

    const host = React.createElement(Host, hostProps);

    return this.hasPlaceholders
      ? React.createElement(React.Fragment, EMPTY_OBJECT, host, ...portals)
      : host;
  }
}
