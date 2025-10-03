import { postRouter } from "./routes/posts";

// Define the CORS headers to be used in all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173", // **Set this to your frontend URL** (or "*" for all origins during development)
  "Access-Control-Allow-Methods": "GET,HEAD,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
};

// You'll need a way to combine the base CORS headers with other response headers
function handleCORS(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

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
    const method = request.method; // Get the request method
    
    try {
      
      // 🚨 NEW: 1. Handle Preflight OPTIONS Requests for ALL paths first 
      if (method === "OPTIONS") {
        return new Response(null, {
          status: 204, // No Content
          headers: {
            // Must include all necessary headers for the preflight check
            ...corsHeaders,
            "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Content-Type", 
          }
        });
      }

      let response;

      // 2. Root Route Handler (/)
      if (path === "/") {
        response = new Response("Hello Worker! I'm serving your API.", { status: 200 });
      }
      
      // 3. Health Check Handler (/ping)
      else if (path === "/ping") {
        response = new Response("OK", { status: 200 });
      }

      // 4. Posts API Routes (/posts, /posts/*)
      else if (path === "/posts" || path.startsWith("/posts/")) {
        // Delegate all /posts/* requests to the posts router
        // NOTE: postRouter *must* return a Response object
        response = await postRouter(request, env);
      } 
      
      // 5. Default Route (404)
      else {
        response = new Response("Not Found", { status: 404 });
      }

      // 6. Apply CORS headers to the final response
      return handleCORS(response);
      
    } catch (e) {
      console.error(e);
      // Ensure the error response also has CORS headers
      const errorResponse = new Response(`Internal Server Error: ${e.message}`, { status: 500 });
      return handleCORS(errorResponse);
    }
  },
};