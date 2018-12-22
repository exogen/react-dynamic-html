import Document from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class DemoDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();

    const { renderPage } = ctx;

    ctx.renderPage = () =>
      renderPage({
        enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: [...initialProps.styles, ...sheet.getStyleElement()]
    };
  }
}
