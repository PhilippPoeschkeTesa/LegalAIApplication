declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';

  interface SwaggerUiOptions {
    explorer?: boolean;
    customSiteTitle?: string;
    swaggerOptions?: any;
    customCss?: string;
    customJs?: string;
  }

  function setup(swaggerDocument: any, options?: SwaggerUiOptions): RequestHandler;
  const serve: RequestHandler[];

  export { setup, serve };
  export default { setup, serve };
}
