import React from "react";
import Document, { Head, Main, NextScript } from "next/document";
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

  render() {
    return (
      <html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i|Source+Sans+Pro:400i,600i"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
