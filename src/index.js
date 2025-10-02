import { postRouter } from "./routes/posts";

/**
 * Main Worker fetch handler.
 * @param {Request} request 
 * @param {Env} env 
 * @returns {Response}
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      if (path === "/posts" || path.startsWith("/posts/")) {
        // Delegate all /posts/* requests to the posts router
        return postRouter(request, env);
      } else {
        // Default route
        return new Response("Not Found", { status: 404 });
      }
      
    } catch (e) {
      console.error(e);
      return new Response(`Internal Server Error: ${e.message}`, { status: 500 });
    }
  },
};