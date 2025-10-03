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
      
      // NEW: 1. Root Route Handler (/)
      if (path === "/") {
        return new Response("Hello Worker! I'm serving your API.", { status: 200 });
      }
      
      // NEW: 2. Health Check Handler (/ping)
      else if (path === "/ping") {
        return new Response("OK", { status: 200 });
      }

      // 3. Posts API Routes (/posts, /posts/*)
      else if (path === "/posts" || path.startsWith("/posts/")) {
        // Delegate all /posts/* requests to the posts router
        return postRouter(request, env);
      } 
      
      // 4. Default Route (404)
      else {
        return new Response("Not Found", { status: 404 });
      }
      
    } catch (e) {
      console.error(e);
      return new Response(`Internal Server Error: ${e.message}`, { status: 500 });
    }
  },
};