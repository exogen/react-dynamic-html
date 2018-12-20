import React from "react";
import ReactDOM from "react-dom";

const regex = /(\{([$\w]+)\})/g;
let renderToString;

const isServer = !process.browser;

function defaultRenderer(name, value, key, hosts, portals) {
  if (typeof value === "string") {
    return value;
  } else if (value == null) {
    return "";
  } else if (React.isValidElement(value)) {
    let serializedValue = "";
    if (isServer) {
      if (!renderToString) {
        renderToString = require("react-dom/server").renderToStaticMarkup;
      }
      serializedValue = renderToString(value);
    } else {
      const host = hosts[key];
      if (host) {
        portals.push(ReactDOM.createPortal(value, host));
      } else {
        // Still need to know that there are placeholders in the template.
        portals.push(null);
      }
    }
    return `<span data-template-key="${key}">${serializedValue}</span>`;
  }
  return value.toString();
}

export default class Template extends React.PureComponent {
  static defaultProps = {
    renderer: defaultRenderer,
    as: "div"
  };

  hostRef = React.createRef();
  cachedHTML = "";

  state = {
    keys: [],
    hosts: {}
  };

  renderTemplate(string, values) {
    const { hosts } = this.state;
    const portals = [];
    const keyMap = new Map();
    const html = string.replace(regex, (match, placeholder, name) => {
      const number = (keyMap.get(name) || 0) + 1;
      keyMap.set(name, number);
      const key = `${name}:${number}`;
      const value = values[name];
      return defaultRenderer(name, value, key, hosts, portals);
    });
    return { html, portals };
  }

  collectHosts() {
    const placeholders = this.hostRef.current.querySelectorAll(
      "[data-template-key]"
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

  render() {
    const { string, values, renderer, as: Host, ...hostProps } = this.props;
    const { html, portals } = this.renderTemplate(string, values);

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
