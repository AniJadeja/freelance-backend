/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request, env, ctx) {
// 		return new Response('Hello World!');
// 	},
// };

/**
 * Interface to define the KV binding available on the 'env' object.
 * This is crucial if you are using TypeScript, but good for documentation in JS.
 * If you are using plain JavaScript, you can omit this interface.
 * * @typedef {Object} Env
 * @property {KVNamespace} POD_BLOG_CONTENT The KV namespace for blog content.
 */

// Simple utility to determine the route
function getRoute(url) {
  const path = url.pathname;
  
  if (path === "/posts") {
    return "POSTS_INDEX";
  }
  
  // Matches /posts/any-slug
  if (path.startsWith("/posts/")) {
    return "POST_SLUG";
  }
  
  return "OTHER";
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
    const route = getRoute(url);
    const slug = url.pathname.substring(7); // Gets "first-post" from "/posts/first-post"

    try {
      if (request.method === "POST" && route === "POST_SLUG") {
        // --- 1. POST /posts/first-post (CREATE/UPDATE) ---
        const { content } = await request.json();
        
        if (!content) {
            return new Response("Missing 'content' field in JSON body.", { status: 400 });
        }

        // We use the slug directly as the KV key
        await env.POD_BLOG_CONTENT.put(slug, content);
        
        return new Response(`Post "${slug}" saved/updated successfully.`, { 
            status: 201 
        });

      } else if (request.method === "GET") {
        
        if (route === "POSTS_INDEX") {
          // --- 2. GET /posts (LIST ALL SLUGS) ---
          const { keys } = await env.POD_BLOG_CONTENT.list();
          
          const slugs = keys.map(key => key.name);
          
          return new Response(JSON.stringify({ 
              slugs, 
              count: slugs.length 
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });

        } else if (route === "POST_SLUG") {
          // --- 3. GET /posts/first-post (READ ONE POST) ---
          
          // **********************************************
          // ** FIX FOR: "is not a constructor" IS HERE **
          // **********************************************
          const markdownContent = await env.POD_BLOG_CONTENT.get(slug); // Line 92 is around here in a full file
          
          if (markdownContent === null) {
            return new Response(`Post "${slug}" not found.`, { status: 404 });
          }
          
          // The fix: You MUST return a NEW Response object,
          // not the raw string or an improperly formatted value.
          return new Response(markdownContent, {
            status: 200,
            headers: { 
                "Content-Type": "text/markdown; charset=utf-8" 
            },
          });
        }
      }

      // --- 4. CATCH-ALL FOR OTHER ROUTES/METHODS ---
      return new Response("Route not found or method not supported.", { status: 404 });

    } catch (e) {
      // General error handling
      console.error(e);
      return new Response(`Internal Server Error: ${e.message}`, { status: 500 });
    }
  },
};